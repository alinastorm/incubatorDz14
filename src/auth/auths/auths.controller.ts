import { Controller, Get, Post } from "@nestjs/common";
import { Body, Headers, Ip, Res } from "@nestjs/common/decorators";
import { Response } from "express";
import { Cookies } from "src/_commons/decorators/cookies.decorator";
import { HTTP_STATUSES } from "src/_commons/types/types";
import { LoginInput } from "./auth.model";
import { AuthService } from "./auths.service";

@Controller("auth")
export class AuthController {

    constructor(
        private authService: AuthService,
    ) { }

    /**
     * @param title Device name: for example Chrome 105 (received by parsing http header "user-agent") 
     * @param body 
     * @param res 
     * @param ip  IP address of device during signing in 
     */
    @Post('login')
    async login(
        @Headers('user-agent') title: string,
        @Body() body: LoginInput,
        @Ip() ip: string,
        @Res() res: Response
    ) {
        const { loginOrEmail, password } = body
        const { accessToken, refreshToken } = await this.authService.Login(loginOrEmail, password, ip, title)

        res.cookie("refreshToken", refreshToken, { maxAge: +process.env.JWT_REFRESH_LIFE_TIME_SECONDS * 1000, httpOnly: true, secure: true })
        res.status(HTTP_STATUSES.OK_200).send(accessToken)
    }

    @Post('logout')
    logout(
        @Cookies('refreshToken') refreshToken: string
    ) {
        return this.authService.logout(refreshToken)
    }

    @Get('me')
    getUserInfo(
        @Cookies('refreshToken') refreshToken: string

    ) {
        return this.authService.getUser(refreshToken)
    }
}

