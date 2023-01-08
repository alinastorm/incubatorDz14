import { Controller, Post } from "@nestjs/common";
import { Body, Headers, Ip, Res } from "@nestjs/common/decorators";
import { Response } from "express";
import { Cookies } from "src/_commons/decorators/cookies.decorator";
import { HTTP_STATUSES } from "src/_commons/types/types";
import { LoginDto, RegistrationDto } from "./authentication.types";
import { AuthenticationService } from "./authentications.service";

@Controller("auth")
export class AuthenticationController {

    constructor(
        private authenticationService: AuthenticationService,
    ) { }

    @Post('registration')
    async registration(
        @Body() body: RegistrationDto
    ) {
        const { email, login, password } = body
        this.authenticationService.registration({ email, login, password })
    }

    /**
     * @param title Device name: for example Chrome 105 (received by parsing http header "user-agent") 
     * @param body 
     * @param res 
     * @param ip  IP address of device during signing in 
     */
    @Post('login')
    async login(
        @Headers('user-agent') title: string,
        @Body() body: LoginDto,
        @Ip() ip: string,
        @Res() res: Response
    ) {
        const { loginOrEmail, password } = body
        const { accessToken, refreshToken } = await this.authenticationService.Login(loginOrEmail, password, ip, title)

        res.cookie("refreshToken", refreshToken, { maxAge: +process.env.JWT_REFRESH_LIFE_TIME_SECONDS * 1000, httpOnly: true, secure: true })
        res.status(HTTP_STATUSES.OK_200).send(accessToken)
    }
    
    @Post('logout')
    logout(
        @Cookies('refreshToken') refreshToken: string
    ) {
        return this.authenticationService.logout(refreshToken)
    }


}