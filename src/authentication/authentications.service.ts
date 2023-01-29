import { HttpException, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { FilterQuery, Model } from "mongoose"
import { User, UserBd, UserBdDocument, UserInfo, UserView } from "../authentication/users/user.model"
import { UsersService } from "../authentication/users/users.service"
import { CryptoService } from "../_commons/services/crypto-service"
import { JwtTokenService } from "../_commons/services/jwtToken-service"
import { HTTP_STATUSES } from "../_commons/types/types"
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "../_commons/services/email-service"
import { add } from 'date-fns'
import { AuthService } from "./auths/auths.service"
import { DeviceSession, DeviceSessionDocument, deviceSessionMapper } from "./devicesSessions/deviceSession.model"
import { Auth, AuthBdDocument } from "./auths/auth.model"
import { RegistrationCode, RegistrationCodeDocument } from "./registrationCodes/registrationCode.model"
import { RegistrationCodeService } from "./registrationCodes/registrationCodes.service"
import { Registration } from "./authentication.types"
import { AccessToken, RefreshToken, RefreshTokenPayload } from "./tokens/tokens-types"
import { DeviceSessionsService } from "./devicesSessions/deviceSessions.service"
import { meViewDataMapper } from './users/user.model'


@Injectable()
export class AuthenticationService {

    constructor(

        private cryptoService: CryptoService,
        private userService: UsersService,
        private jwtTokenService: JwtTokenService,
        private emailService: EmailService,
        private authService: AuthService,
        private registrationCodeService: RegistrationCodeService,
        private deviceSessionsService: DeviceSessionsService,

    ) { }

    async registration(data: Registration) {
        const { email, login, password } = data
        const usersByLogin: UserBd[] = await this.userService.readAll({ login })
        if (usersByLogin.length) throw new HttpException([{ message: "login exist", field: "login" }], HTTP_STATUSES.BAD_REQUEST_400)
        const usersByEmails: UserBd[] = await this.userService.readAll({ email })
        if (usersByEmails.length) throw new HttpException([{ message: "email exist", field: "email" }], HTTP_STATUSES.BAD_REQUEST_400)

        //создаем юзера        
        const user = await this.userService.addOne({ email, login }, false)
        const { id: userId, createdAt } = user
        //сохраняем auth (login pass)
        const auth = await this.authService.addOne({ createdAt, password, userId })
        const { id: idAuth } = auth
        //отправляем письмо
        const subject = "activation code"
        const code = uuidv4()
        const link = `${process.env.API_URL}/auth/registration-confirmation?code=${code}`
        const message =
            `
            <h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
               <a href='${link}'>complete registration</a>
           </p>
        `
        try {
            this.emailService.sendEmail(email, subject, message)
        } catch (error) {
            await this.userService.deleteOne(userId)
            await this.authService.deleteOne(idAuth)
            throw new HttpException([{ message: "send mail error", field: "email" }], HTTP_STATUSES.BAD_REQUEST_400)
        }
        //сохраняем регистрационный код
        const expirationDate = add(new Date(), {
            hours: 1,
            minutes: 3
        })
        //минимальное время откладывающее переотправку 
        // const restartTime = add(new Date(), {
        //     minutes: 2
        // })
        const element: RegistrationCode = { email, code, expirationDate, userId }
        // const element: Omit<RegistrationCodeViewModel, 'id'> = { email, code, expirationDate, userId, restartTime }
        await this.registrationCodeService.addOne(element)
    }
    /** Try login user to the system
     * Высылает rfresh access tokens и генриует device session
     * @param {string} ip (req.ip) IP address of device during signing in. 
     * @param {string} title (req.headers['user-agent']) Device name: for example Chrome 105 (received by parsing http header "user-agent". 
    */
    async Login(loginOrEmail: string, password, ip: string, title: string) {

        // Проверяем существование юзера с указанным логином
        const filter: FilterQuery<UserBd> = {
            $or: [
                { email: { $regex: loginOrEmail, $options: 'i' } },
                { login: { $regex: loginOrEmail, $options: 'i' } }
            ]
        }

        const users: UserBd[] = await this.userService.readAll(filter)
        if (!users.length) throw new HttpException([{ message: "loginOrEmail not exist", field: "loginOrEmail" }], HTTP_STATUSES.UNAUTHORIZED_401)

        // Проверяем подтверждение почты пользователя
        const user = users[0]
        if (user.confirm !== true) throw new HttpException([{ message: "email not confirmed", field: "loginOrEmail" }], HTTP_STATUSES.UNAUTHORIZED_401)

        // Достаем hash юзера
        // Проверяем существование hash в bd
        const userId = user._id.toString()
        const auths = await this.authService.readAll({ userId })
        const auth = auths[0]
        if (!auth) throw new HttpException([{ message: "No auth", field: "auth" }], HTTP_STATUSES.UNAUTHORIZED_401)

        // Проверка равенства пароля и hasha в bd
        const passwordHash = auth.passwordHash
        const isEqual = await this.cryptoService.checkPasswordByHash(passwordHash, password)
        if (!isEqual) throw new HttpException([{ message: "Pass wrong", field: "password" }], HTTP_STATUSES.UNAUTHORIZED_401)

        // TODO Проверка существования в сессиях присланного deviceId или отправка запроса нового устройства если не прислано.Пусть присылают в body deviceId из localStorage длительного хранения. Сброс на нижний уровень где есть доверие к мылу. При подтвеждении мыла можно сеитить deviceId и отправлять на мыло сообщение (что бы два раза в первый раз не дурить голову)
        // Генерация токенов Access Refresh
        const accessToken: AccessToken = this.jwtTokenService.generateAccessToken({ userId })
        const deviceId: string = uuidv4()// Id of connected device session
        const refreshToken: RefreshToken = this.jwtTokenService.generateRefreshToken({ userId, deviceId })

        // Записываем device Session      
        const iat: number = this.jwtTokenService.getIatFromToken(refreshToken) //iat from token
        const lastActiveDate: string = iat.toString()//Date of the last generating of refresh/access tokens 
        const element: DeviceSession = { lastActiveDate, deviceId, ip, title, userId }
        this.deviceSessionsService.addOne(element)
        const a = 1
        return { accessToken, refreshToken }
    }
    /**
     * Фактически просто удаляет device Sessions
     * @param refreshToken 
     */
    async logout({ userId, deviceId, lastActiveDate }) {

        //проверяем существование сесси с userId, deviceId,lastActiveDate. Может по ней уже вышли logout или рефрешнули токен. 
        const deviceSessions = await this.deviceSessionsService.readAll({ userId, deviceId, lastActiveDate })
        if (!deviceSessions.length) throw new HttpException([{ message: "deviceSessions not found", field: "refreshToken" }], HTTP_STATUSES.UNAUTHORIZED_401)
        //удаляем сессии с userId, deviceId
        await this.deviceSessionsService.deleteMany({ userId, deviceId })
    }
    async readUserInfo(userId: string) {

        const users = await this.userService.readAll({ _id: userId })
        const user = users[0]
        if (!user) throw new HttpException([{ message: "userId not exist", field: "userId" }], HTTP_STATUSES.NOT_FOUND_404)
        return meViewDataMapper(user)

    }

}