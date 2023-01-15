import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { JwtTokenService } from "../../_commons/services/jwtToken-service"

import { RefreshTokenPayload } from "../tokens/tokens-types"
import { DeviceSession, DeviceSessionBd, DeviceSessionDocument, deviceSessionMapper, DeviceSessionView } from "./deviceSession.model"

@Injectable()
export class DeviceSessionsService {

    constructor(
        private jwtTokenService: JwtTokenService,
        @InjectModel(DeviceSession.name) private DeviceSessionModel: Model<DeviceSessionDocument>,

    ) { }
    async addOne(data: DeviceSession) {
        return await this.DeviceSessionModel.create(data)
    }
    async readAll(filter: Partial<DeviceSession>) {
        return await this.DeviceSessionModel.find({ filter }).lean()
    }
    /**
     * Удаление всех сессий кроме текущей
     * @param refreshToken 
     */
    async deleteAllExcludeCurrent({ userId, deviceId }) {
        // const user: RefreshTokenPayload = this.jwtTokenService.getDataByRefreshToken(refreshToken)
        // const { userId, deviceId: tokenDeviceId } = user

        const deviceSessionsDb = await this.DeviceSessionModel.find({ userId })
        await Promise.all(deviceSessionsDb.map(
            async (sessionDb) => {
                if (sessionDb.deviceId != deviceId) await this.DeviceSessionModel.deleteOne({ _id: sessionDb.id })
            })
        )
    }
    async deleteOneByDeviceId(deviceId: string) {
        const result = await this.DeviceSessionModel.deleteOne({ deviceId })
        return result.deletedCount === 1
    }
    async deleteMany(filter: Partial<DeviceSession>) {
        // const user: RefreshTokenPayload = this.jwtTokenService.getDataByRefreshToken(refreshToken)
        // const { userId, deviceId } = user

        await this.DeviceSessionModel.deleteMany(filter)

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
    // async toView(data: DeviceSessionDocument | DeviceSessionDocument[] | null) {
    //     if (!data) return null
    //     if (Array.isArray(data)) {
    //         return data.map(deviceSessionMapper)
    //     }
    //     return deviceSessionMapper(data)
    // }


}
