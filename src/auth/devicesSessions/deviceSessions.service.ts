import { HttpException, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { JwtTokenService } from "src/_commons/services/jwtToken-service"
import { HTTP_STATUSES } from "src/_commons/types/types"
import { Auth } from "../auths/auth.model"
import { RefreshTokenPayload } from "../tokens/tokens-types"
import { DeviceSessionBd, DeviceSessionDocument, DeviceSessionView } from "./deviceSession.model"

@Injectable()
export class DeviceSessionsService {

    constructor(
        private jwtTokenService: JwtTokenService,
        @InjectModel(Auth.name) private DeviceSessionModel: Model<DeviceSessionDocument>,

    ) { }

    async readAll(refreshToken: string) {

        const user: RefreshTokenPayload = this.jwtTokenService.getDataByRefreshToken(refreshToken)
        const { userId } = user

        const deviceSessions = await this.DeviceSessionModel.find({ userId })
        const result: DeviceSessionView[] = deviceSessions.map(({ deviceId, ip, title, lastActiveDate }) => {
            return { deviceId, ip, title, lastActiveDate: new Date(+lastActiveDate * 1000).toISOString() }
        })
        return result
    }
    /**
     * Удаление всех сессий кроме текущей
     * @param refreshToken 
     */
    async deleteAllExcludeCurrent(refreshToken: string) {
        const user: RefreshTokenPayload = this.jwtTokenService.getDataByRefreshToken(refreshToken)
        const { userId, deviceId: tokenDeviceId } = user

        const deviceSessionsDb = await this.DeviceSessionModel.find({ userId })
        await Promise.all(deviceSessionsDb.map(
            async (sessionDb) => {
                if (sessionDb.deviceId != tokenDeviceId) await this.DeviceSessionModel.deleteOne({ _id: sessionDb.id })
            })
        )
    }
    async deleteOne(refreshToken: string) {
        const user: RefreshTokenPayload = this.jwtTokenService.getDataByRefreshToken(refreshToken)
        const { userId, deviceId } = user

        await this.DeviceSessionModel.deleteMany({ userId, deviceId })

        // //проверяем существование сессии 
        // const deviceSessions = await this.DeviceSessionModel.find({ deviceId })
        // if (!deviceSessions.length) throw new HttpException([{ message: "not found", field: "deviceId" }], HTTP_STATUSES.NOT_FOUND_404)
        // //фильтруем сессии по владельцу userId из токена
        // const filterSessionsByUserId = deviceSessions.filter((ds) => {
        //     return ds.userId === userId
        // })
        // if (!filterSessionsByUserId.length) throw new HttpException([{ message: "no sessions", field: "userId" }], HTTP_STATUSES.NO_ACCESS_CONTENT_403)
        // //удаляем сессии 
        // filterSessionsByUserId.forEach(async (ds) => {
        //     await this.DeviceSessionModel.deleteOne({ _id: ds.id })
        // })

    }
}
