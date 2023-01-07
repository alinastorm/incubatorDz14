import { Controller, Get, Delete } from "@nestjs/common";
import { Cookies } from "src/_commons/decorators/cookies.decorator";
import { DeviceSessionsService } from "./deviceSessions.service";


@Controller("security")
export class DevicesSessionsController {

    constructor(private deviceSessionsService: DeviceSessionsService) { }

    @Get('devices')
    async readAllSessions(
        @Cookies('refreshToken') refreshToken: string
    ) {
        return this.deviceSessionsService.readAll(refreshToken)
    }

    @Delete('devices')
    async deleteAllExcludeCurrentSessions(
        @Cookies('refreshToken') refreshToken: string
    ) {
        return this.deviceSessionsService.deleteAllExcludeCurrent(refreshToken)
    }

    @Get('devices')
    async deleteOne(
        @Cookies('refreshToken') refreshToken: string
    ) {
        return this.deviceSessionsService.deleteOne(refreshToken)
    }
}