import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: () => void) {
        console.log(`Data sent in response: ${res}`);
        next();
    }
}

