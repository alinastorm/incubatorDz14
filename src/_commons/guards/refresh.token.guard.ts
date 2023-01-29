import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenService } from '../services/jwtToken-service';
import { RefreshTokenPayload } from '../../authentication/tokens/tokens-types';
import { HTTP_STATUSES } from '../types/types';

@Injectable()
export class RefreshTokenGuard implements CanActivate {

  constructor(private readonly jwtTokenService: JwtTokenService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & { refreshToken: { lastActiveDate: string } & RefreshTokenPayload } = context.switchToHttp().getRequest();
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new UnauthorizedException('No refreshToken in cookies');

    const user: RefreshTokenPayload = this.jwtTokenService.getDataByRefreshToken(refreshToken)
    if (!user) throw new HttpException([{ message: "refreshToken error", field: "refreshToken" }], HTTP_STATUSES.UNAUTHORIZED_401)
    const { userId, deviceId } = user
    const iat: number = this.jwtTokenService.getIatFromToken(refreshToken) //iat from token
    const lastActiveDate = iat.toString()

    req.refreshToken = { userId, deviceId, lastActiveDate }
    return true;
  }


}
