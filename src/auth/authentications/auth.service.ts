// import { HttpException, Injectable } from "@nestjs/common"
// import { InjectModel } from "@nestjs/mongoose"
// import { Model } from "mongoose"
// import { User, UserBd, UserBdDocument } from "src/users/user.model"
// import { UserService } from "src/users/users.service"
// import { CryptoService } from "src/_commons/services/crypto-service"
// import { HTTP_STATUSES } from "src/_commons/types/types"
// import { Auth, AuthBd, AuthDocument, LoginSuccessView } from "./auth.model"



// @Injectable()
// export class AuthService {

//     constructor(
//         @InjectModel(User.name) private UserModel: Model<UserBdDocument>,
//         @InjectModel(Auth.name) private AuthModel: Model<AuthDocument>,
//         private cryptoService: CryptoService,
//         protected userService: UserService
//     ) { }
//     /** Try login user to the system*/
//     async Login(loginOrEmail:string, password) {
//         // Проверяем существование юзера с указанным логином
//         const users = await this.userService.readAll(loginOrEmail)
//         // const users = await this.UserModel.repositoryReadAll<UserBd>({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] })
//         const user = users[0]
//         if (!user) throw new HttpException([{ message: "loginOrEmail not exist", field: "loginOrEmail" }], HTTP_STATUSES.UNAUTHORIZED_401)
//         // Проверяем подтверждение почты пользователя
//         if (user.confirm !== true) return res.status(HTTP_STATUSES.UNAUTHORIZED_401).send("Not confirm email")
//         // Достаем hash юзера
//         // Проверяем существование hash в bd
//         const userId = user.id
//         const auths = await this.AuthModel.repositoryReadAll<AuthBd>({ userId })
//         const auth = auths[0]
//         if (!auth) return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401).send("No auth")
//         // Проверка равенства пароля и hasha в bd
//         const passwordHash = auth.passwordHash
//         const isEqual = await this.cryptoService.checkPasswordByHash(passwordHash, password)
//         if (!isEqual) return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401).send("Pass wrong")
//         // TODO Проверка существования в сессиях присланного deviceId или отправка запроса нового устройства если не прислано.Пусть присылают в body deviceId из localStorage длительного хранения. Сброс на нижний уровень где есть доверие к мылу. При подтвеждении мыла можно сеитить deviceId и отправлять на мыло сообщение (что бы два раза в первый раз не дурить голову)
//         // Генерация токенов Access Refresh
//         const accessToken: LoginSuccessView = jwtTokenService.generateAccessToken({ userId })
//         const deviceId: string = uuidv4()// Id of connected device session
//         const refreshToken: string = jwtTokenService.generateRefreshToken({ userId, deviceId })
//         const maxAgeSeconds = process.env.JWT_REFRESH_LIFE_TIME_SECONDS || console.log("No JWT_REFRESH_LIFE_TIME_SECONDS");

//         const maxAgeMiliSeconds = +maxAgeSeconds * 1000
//         // Записываем device Session        
//         const ip: string = req.ip // IP address of device during signing in 
//         const title: string = req.headers['user-agent']// Device name: for example Chrome 105 (received by parsing http header "user-agent") 
//         const iat: number = jwtTokenService.getIatFromToken(refreshToken) //iat from token
//         const lastActiveDate: string = iat.toString()//Date of the last generating of refresh/access tokens 
//         const element: Omit<DeviceBdModel, "id"> = { lastActiveDate, deviceId, ip, title, userId }
//         DeviceSessionModel.repositoryCreateOne(element)

//         // Отправка токенов Access Refresh
//         res.cookie("refreshToken", refreshToken, { maxAge: maxAgeMiliSeconds, httpOnly: true, secure: true })
//         res.status(HTTP_STATUSES.OK_200).send(accessToken)
//     }
//     /**In cookie client must send correct refreshToken that will be revoked
//      * Задача бека, отметить refreshToken как невалидный (токен приходит в cookie)
//     */
//     async logout(
//         req: RequestWithCookies<{ refreshToken: string }> & { user: RefreshTokenPayloadModel },
//         res:
//             ResponseWithCode<204> &
//             ResponseWithCode<401>
//     ) {
//         // deprecated //добавляем в списаные
//         // const reqRefreshToken = req.cookies.refreshToken
//         // createOneCanceledToken(reqRefreshToken)

//         const { deviceId, userId } = req.user
//         const deviceSessions = await DeviceSessionModel.repositoryReadAll<DeviceBdModel>({ deviceId, userId })
//         deviceSessions.forEach(async ({ id }) => {
//             await DeviceSessionModel.repositoryDeleteOne(id)
//         })
//         res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
//     }
//     async getUser(
//         req: RequestWithHeaders<{ authorization: string }> & { user: { userId: string } },
//         res: ResponseWithBodyCode<MeViewModel, 200 | 401 | 500>
//     ) {
//         const userId = req.user.userId
//         //ищем юзера по id
//         const user: UserViewModel | null = await UserModel.repositoryReadOne(userId)
//         if (!user) return res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500)
//         const result: MeViewModel = {
//             email: user.email,
//             login: user.login,
//             userId: user.id
//         }
//         res.status(HTTP_STATUSES.OK_200).send(result)
//     }

// }