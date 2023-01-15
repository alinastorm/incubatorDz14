import { HttpException, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { JwtTokenService } from "../../_commons/services/jwtToken-service"
import { HTTP_STATUSES } from "../../_commons/types/types"
import { DeviceSession, DeviceSessionBd, DeviceSessionDocument } from "../devicesSessions/deviceSession.model"
import { RefreshTokenPayload } from "./tokens-types"


@Injectable()
export class TokensService {


    constructor(
        private jwtTokenService: JwtTokenService,
        @InjectModel(DeviceSession.name) private DeviceSessionModel: Model<DeviceSessionDocument>,

    ) { }

    /**Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
     * Клиент отправляет на бек refreshToken в cookie, мы должны вернуть новую пару токенов (старый refreshToken добавляем в списанные)
     */
    async refreshTokens(refreshToken: string) {
        const user: RefreshTokenPayload = this.jwtTokenService.getDataByRefreshToken(refreshToken)
        if (!user) throw new HttpException([{ message: "refreshToken error", field: "refreshToken" }], HTTP_STATUSES.UNAUTHORIZED_401)
        const { userId, deviceId } = user

        //проверяем есть ли сессия в бд соответствующуя из рефреш токена дате(iat) и deviceId 
        const iat: number = this.jwtTokenService.getIatFromToken(refreshToken) //iat from token
        const lastActiveDate = iat.toString()
        const deviceSessionsByUserDeviceDate = await this.DeviceSessionModel.find({ userId, deviceId, lastActiveDate })
        const deviceSessionBd: DeviceSessionBd = deviceSessionsByUserDeviceDate[0]
        const deviceSessionsByDevice = await this.DeviceSessionModel.find({ userId, deviceId })
        // проверка  на перехват сессии . Будет другая дата
        if (!deviceSessionBd) {
            if (deviceSessionsByDevice) {
                deviceSessionsByDevice.forEach(async (session) => {
                    const id = session.id
                    await this.DeviceSessionModel.deleteOne({ _id: id })
                })
                //TODO send danger email токен перехвачен дата другая. Сессии этого устройства разорваны
            }
            //refreshToken после logout
            throw new HttpException([{ message: "not found deviceSession", field: "refreshToken" }], HTTP_STATUSES.UNAUTHORIZED_401)
        }
        //TODO Проверка смены страны по ip нужен сервис определения// const ip: string = req.ip // IP address of device during signing in 
        // if (deviceSession.ip != ip || deviceSession.title != title) {

        // //проверяем соотвествует ли текущий title из req, сохраненной сессии в бд.
        // const reqTitle: string = req.headers['user-agent']// Device name: for example Chrome 105 (received by parsing http header "user-agent") 
        // if (deviceSessionBd.title != reqTitle) {
        //     // проверка  на перехват сессии . Будет другой ip или title
        //     if (deviceSessionsByDevice) {
        //         deviceSessionsByDevice.forEach(async (session) => {
        //             const id = session.id
        //             await deviceSessionRepository.deleteOne(id)
        //         })
        //         //TODO send danger email токен перехвачен ip или title другой. Сессии этого устройства разорваны
        //     }
        //     return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        // }
        //Генерируем токены
        const newRefreshToken = this.jwtTokenService.generateRefreshToken({ userId, deviceId })
        const newAccessToken = this.jwtTokenService.generateAccessToken({ userId })
        //обновляем сессию
        const newIat = this.jwtTokenService.getIatFromToken(newRefreshToken)
        const newLastActiveDate = newIat.toString()
        const deviceSessionId = deviceSessionBd._id.toString()
        const updateData = { lastActiveDate: newLastActiveDate }
        // const data = { ...deviceSessionBd, lastActiveDate: newLastActiveDate }
        await this.DeviceSessionModel.updateOne({ _id: deviceSessionId }, updateData)
        //deprecated //добавляем в списаные
        // const reqRefreshToken = req.cookies.refreshToken
        // createOneCanceledToken(reqRefreshToken)
        return { newRefreshToken, newAccessToken }

    }

}