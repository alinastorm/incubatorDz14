import { Injectable } from "@nestjs/common"
import { JwtService } from '@nestjs/jwt';
import { LoginSuccessView } from "src/auth/authentications/auth.model"
import { AccessTokenPayload, RefreshTokenPayload } from "src/auth/tokens/tokens-types"


@Injectable()
export class jwtTokenService {
    
    constructor(
        private jwtService: JwtService
    ) { }

    generateAccessToken(payload: AccessTokenPayload) {
        const seconds = process.env.JWT_ACCESS_LIFE_TIME_SECONDS ?? console.log("No JWT_ACCESS_LIFE_TIME_SECONDS");
        // console.log('******ACCESS expiresIn:', `${seconds}s`);
        const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: `${seconds}s` })
        const result: LoginSuccessView = { accessToken }
        return result
    }
    generateRefreshToken(payload: RefreshTokenPayload) {
        const seconds = process.env.JWT_REFRESH_LIFE_TIME_SECONDS ?? console.log("JWT_REFRESH_LIFE_TIME_SECONDSS");
        // console.log('******REFRESH expiresIn:', `${seconds}s`);
        const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: `${seconds}s` })
        return refreshToken
    }
    getDataByAccessToken(token: string) {
        try {
            const result = this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET })
            return result as AccessTokenPayload
        } catch (error) {
            console.log("error getDataByAccessToken------------------", error);
            return null
        }
    }
    getDataByRefreshToken(token: string) {
        try {
            const result: any = this.jwtService.verify(token, { secret: process.env.JWT_REFRESH_SECRET })
            return result as RefreshTokenPayload
        } catch (error) {
            return null
        }
    }
    getIatFromToken(token: string) {
        const payloadBase64 = token.split('.')[1]
        const buff = Buffer.from(payloadBase64, 'base64');
        const payloadText = buff.toString('ascii');
        const payloadObject: { iat: number } = JSON.parse(payloadText)
        const { iat } = payloadObject
        return iat
    }
}
