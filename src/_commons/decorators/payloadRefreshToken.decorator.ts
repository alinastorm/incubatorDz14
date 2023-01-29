import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshTokenPayload } from '../../authentication/tokens/tokens-types';

// если true data достает данные из req.refreshToken иначе req.refreshToken
export const PayloadRefreshToken = createParamDecorator(
    (data: string, ctx: ExecutionContext): Partial<{ refreshToken: { lastActiveDate: string } & RefreshTokenPayload }> | { refreshToken: { lastActiveDate: string } & RefreshTokenPayload } => {
        const request = ctx.switchToHttp().getRequest();
        return data ? request.refreshToken?.[data] : request.refreshToken;
    },
);