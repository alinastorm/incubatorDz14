import { Controller, HttpException, Post, Res } from "@nestjs/common";
import { Cookies } from "../../_commons/decorators/cookies.decorator";
import { TokensService } from "./tokens.service";
import { Response } from "express";

@Controller("auth")
export class TokensController {

    constructor(
        private tokenService: TokensService,
    ) { }


    @Post('refresh-token')
    async refreshToken(
        @Cookies('refreshToken') refreshToken: string,
        @Res({ passthrough: true }) res: Response
    ) {
        try {
            const { newRefreshToken, newAccessToken } = await this.tokenService.refreshTokens(refreshToken)
            res.cookie("refreshToken", newRefreshToken, { maxAge: +process.env.JWT_REFRESH_LIFE_TIME_SECONDS ?? 20 * 1000, httpOnly: true, secure: true })// maxAge: 10 milliseconds
            res.send(newAccessToken)
        } catch (error) {
            throw new HttpException(error.response, error.status);
        }
    }

}

