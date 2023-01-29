import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { HTTP_STATUSES } from '../types/types';

@Injectable()
export class BasicAuthGuard implements CanActivate {

  basicLogin: string = process.env.BASIC_LOGIN
  basicPass: string = process.env.BASIC_PASS

  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const isBasicAuthorization = req.headers.authorization?.startsWith('Basic')
    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    // Verify Basic format, login and password 
    if (isBasicAuthorization && login && password && login === this.basicLogin && password === this.basicPass) {
      // Access 
      return true
    }
    //Deny access
    throw new HttpException([{ message: "Basic auth error", field: "authorization" }], HTTP_STATUSES.UNAUTHORIZED_401)
  }
}
