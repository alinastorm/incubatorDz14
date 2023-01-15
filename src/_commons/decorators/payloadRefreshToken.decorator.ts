import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshTokenPayload } from 'src/authentication/tokens/tokens-types';

export const PayloadRefreshToken = createParamDecorator(
    (data: string, ctx: ExecutionContext): Partial<{ refreshToken: { lastActiveDate: string } & RefreshTokenPayload }>|{ refreshToken: { lastActiveDate: string } & RefreshTokenPayload } => {
        const request = ctx.switchToHttp().getRequest();
        return data ? request.refreshToken?.[data] : request.refreshToken;
    },
);