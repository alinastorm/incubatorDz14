import { HttpException, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { User, UserBd, UserBdDocument, UserView } from "src/users/user.model"
import { UserService } from "src/users/users.service"
import { CryptoService } from "src/_commons/services/crypto-service"
import { JwtTokenService } from "src/_commons/services/jwtToken-service"
import { HTTP_STATUSES } from "src/_commons/types/types"
import { Auth, AuthBd, AuthDocument, LoginSuccessView, MeView } from "./auth.model"
import { v4 as uuidv4 } from "uuid";
import { DeviceSession, DeviceSessionBd, DeviceSessionDocument } from "../devicesSessions/deviceSession.model"
import { RefreshTokenPayload } from "../tokens/tokens-types"



@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private UserModel: Model<UserBdDocument>,
        @InjectModel(Auth.name) private AuthModel: Model<AuthDocument>,
        @InjectModel(Auth.name) private DeviceSessionModel: Model<DeviceSessionDocument>,
        private cryptoService: CryptoService,
        private userService: UserService,
        private jwtTokenService: JwtTokenService,

    ) { }

    /** Try login user to the system
     * @param {string} ip (req.ip) IP address of device during signing in. 
     * @param {string} title (req.headers['user-agent']) Device name: for example Chrome 105 (received by parsing http header "user-agent". 
    */
    async Login(loginOrEmail: string, password, ip: string, title: string) {

        // Проверяем существование юзера с указанным логином
        const users: UserBd[] = await this.userService.readAll(loginOrEmail)
        if (!users.length) throw new HttpException([{ message: "loginOrEmail not exist", field: "loginOrEmail" }], HTTP_STATUSES.UNAUTHORIZED_401)

        // Проверяем подтверждение почты пользователя
        const user = users[0]
        if (user.confirm !== true) throw new HttpException([{ message: "email not confirmed", field: "loginOrEmail" }], HTTP_STATUSES.UNAUTHORIZED_401)

        // Достаем hash юзера
        // Проверяем существование hash в bd
        const userId = user._id.toString()
        const auths = await this.AuthModel.find({ _id: userId })
        const auth = auths[0]
        if (!auth) throw new HttpException([{ message: "No auth", field: "auth" }], HTTP_STATUSES.UNAUTHORIZED_401)

        // Проверка равенства пароля и hasha в bd
        const passwordHash = auth.passwordHash
        const isEqual = await this.cryptoService.checkPasswordByHash(passwordHash, password)
        if (!isEqual) throw new HttpException([{ message: "Pass wrong", field: "password" }], HTTP_STATUSES.UNAUTHORIZED_401)

        // TODO Проверка существования в сессиях присланного deviceId или отправка запроса нового устройства если не прислано.Пусть присылают в body deviceId из localStorage длительного хранения. Сброс на нижний уровень где есть доверие к мылу. При подтвеждении мыла можно сеитить deviceId и отправлять на мыло сообщение (что бы два раза в первый раз не дурить голову)
        // Генерация токенов Access Refresh
        const accessToken: LoginSuccessView = this.jwtTokenService.generateAccessToken({ userId })
        const deviceId: string = uuidv4()// Id of connected device session
        const refreshToken: string = this.jwtTokenService.generateRefreshToken({ userId, deviceId })

        // Записываем device Session      
        const iat: number = this.jwtTokenService.getIatFromToken(refreshToken) //iat from token
        const lastActiveDate: string = iat.toString()//Date of the last generating of refresh/access tokens 
        const element: DeviceSession = { lastActiveDate, deviceId, ip, title, userId }
        this.DeviceSessionModel.create(element)

        return { accessToken, refreshToken }
    }
    async logout(refreshToken: string) {
        const user: RefreshTokenPayload = this.jwtTokenService.getDataByRefreshToken(refreshToken)
        const { userId, deviceId } = user
        if (!userId || !deviceId) throw new HttpException([{ message: "not valid refreshToken", field: "refreshToken" }], HTTP_STATUSES.UNAUTHORIZED_401)
        await this.DeviceSessionModel.deleteMany({ deviceId, userId })
    }
    async getUser(refreshToken: string) {
        const userId = this.jwtTokenService.getDataByRefreshToken(refreshToken)?.userId
        const user: UserView | null = await this.UserModel.findById(userId).lean()
        if (!user) throw new HttpException([{ message: "userId not exist", field: "userId" }], HTTP_STATUSES.NOT_FOUND_404)
        const result: MeView = {
            email: user.email,
            login: user.login,
            userId: user.id
        }
        return result
    }

}