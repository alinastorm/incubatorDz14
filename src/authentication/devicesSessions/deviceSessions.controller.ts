import { Controller, Get, Delete, Post, Param, UseGuards } from "@nestjs/common";
import { PayloadRefreshToken } from "../../_commons/decorators/payloadRefreshToken.decorator";
import { RefreshTokenGuard } from "../../_commons/guards/refresh.token.guard";
import { Cookies } from "../../_commons/decorators/cookies.decorator";
import { RefreshTokenPayload } from "../tokens/tokens-types";
import { DeviceSessionsService } from "./deviceSessions.service";


@Controller("security")
export class DevicesSessionsController {

    constructor(private deviceSessionsService: DeviceSessionsService) { }

    @Get('devices')
    @UseGuards(RefreshTokenGuard)
    async readAllSessions(
        @PayloadRefreshToken() payloadRefreshToken:  RefreshTokenPayload & { lastActiveDate: string }
    ) {
        return this.deviceSessionsService.readAll(payloadRefreshToken)
    }

    @Post('devices')
    async deleteAllExcludeCurrentSessions(
        @PayloadRefreshToken() payloadRefreshToken: RefreshTokenPayload & { lastActiveDate: string }
    ) {
        const { userId, deviceId } = payloadRefreshToken
        return this.deviceSessionsService.deleteAllExcludeCurrent({ userId, deviceId })
    }

    @Delete('devices')
    async deleteOne(
        @Param('deviceId') deviceId: string
    ) {
        return this.deviceSessionsService.deleteOneByDeviceId(deviceId)
    }


}