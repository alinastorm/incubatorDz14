import { Controller, Post, HttpException, UseGuards, Get } from "@nestjs/common";
import { Body, Headers, Ip, Res } from "@nestjs/common/decorators";
import { Response } from "express";
import { PayloadRefreshToken } from "src/_commons/decorators/payloadRefreshToken.decorator";
import { RefreshTokenGuard } from "src/_commons/guards/refresh.token.guard";
import { Cookies } from "../_commons/decorators/cookies.decorator";
import { HTTP_STATUSES } from "../_commons/types/types";
import { LoginDto, RegistrationDto } from "./authentication.types";
import { AuthenticationService } from "./authentications.service";
import { RefreshTokenPayload } from "./tokens/tokens-types";

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
        return this.authenticationService.registration({ email, login, password })
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
        try {
            const { loginOrEmail, password } = body
            const { accessToken, refreshToken } = await this.authenticationService.Login(loginOrEmail, password, ip, title)
            res.cookie("refreshToken", refreshToken, { maxAge: +process.env.JWT_REFRESH_LIFE_TIME_SECONDS * 1000, httpOnly: true, secure: true })
            res.send(accessToken)
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }

    @Post('logout')
    @UseGuards(RefreshTokenGuard)
    logout(
        @PayloadRefreshToken() payloadRefreshToken: RefreshTokenPayload & { lastActiveDate: string }
    ) {
        const { userId, deviceId, lastActiveDate } = payloadRefreshToken
        return this.authenticationService.logout({ userId, deviceId, lastActiveDate })
    }

    @Get('me')
    @UseGuards(RefreshTokenGuard)
    async getUserInfo(
        @PayloadRefreshToken() payloadRefreshToken: RefreshTokenPayload & { lastActiveDate: string }
    ) {
        const { userId } = payloadRefreshToken
        return await this.authenticationService.readUserInfo(userId)
    }


}