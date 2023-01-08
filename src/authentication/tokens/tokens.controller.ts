import { Controller, Post, Res } from "@nestjs/common";
import { Cookies } from "src/_commons/decorators/cookies.decorator";
import { TokensService } from "./tokens.service";
import { Response } from "express";
import { HTTP_STATUSES } from "src/_commons/types/types";

@Controller("auth")

export class TokensController {

    constructor(
        private tokenService: TokensService,
    ) { }


    @Post('refresh-token')
    async refreshToken(
        @Cookies('refreshToken') refreshToken: string,
        @Res() res: Response
    ) {
        const { newRefreshToken, newAccessToken } = await this.tokenService.refreshTokens(refreshToken)

        res.cookie("refreshToken", newRefreshToken, { maxAge: +process.env.JWT_REFRESH_LIFE_TIME_SECONDS ?? 20 * 1000, httpOnly: true, secure: true })// maxAge: 10 milliseconds
        res.status(HTTP_STATUSES.OK_200).json(newAccessToken)
    }



}

