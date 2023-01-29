import { Injectable } from "@nestjs/common"
import { JwtService } from '@nestjs/jwt';
import { AccessToken, AccessTokenPayload, RefreshTokenPayload } from "../../authentication/tokens/tokens-types"



@Injectable()
export class JwtTokenService {

    secretAccess: string = process.env.JWT_ACCESS_SECRET
    secretRefresh: string = process.env.JWT_REFRESH_SECRET
    acessLife: string = process.env.JWT_ACCESS_LIFE_TIME_SECONDS
    refreshLife: string = process.env.JWT_REFRESH_LIFE_TIME_SECONDS

    constructor(private jwtService: JwtService) { }

    generateAccessToken(payload: AccessTokenPayload) {
        const seconds = this.acessLife ?? console.log("No JWT_ACCESS_LIFE_TIME_SECONDS");
        // console.log('******ACCESS expiresIn:', `${seconds}s`);
        const accessToken = this.jwtService.sign(payload, { secret: this.secretAccess, expiresIn: `${seconds}s` })
        return accessToken
    }
    generateRefreshToken(payload: RefreshTokenPayload) {
        const seconds = this.refreshLife ?? console.log("NO JWT_REFRESH_LIFE_TIME_SECONDSS");
        // console.log('******REFRESH expiresIn:', `${seconds}s`);
        const refreshToken = this.jwtService.sign(payload, { secret: this.secretRefresh, expiresIn: `${seconds}s` })
        return refreshToken
    }
    getDataByAccessToken(token: string) {
        try {
            const result = this.jwtService.verify(token, { secret: this.secretAccess })
            return result as AccessTokenPayload
        } catch (error) {
            console.log("error getDataByAccessToken------------------", error);
            return null
        }
    }
    getDataByRefreshToken(token: string): RefreshTokenPayload | null {
        try {
            const result: any = this.jwtService.verify(token, { secret: this.secretRefresh })
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
