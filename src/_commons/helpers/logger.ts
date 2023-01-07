import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, path,originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const hostname = require('os').hostname();
    const referer = request.get('referer') || '';

    response.on('close', () => {
      const { statusCode, statusMessage, } = response;
      const contentLength = response.get('content-length');

      this.logger.log(
        `[${hostname}] "${method} ${path} ${originalUrl}" ${statusCode} ${statusMessage} ${contentLength} "${referer}"- ${userAgent} ${ip}`
      );
    });
    next();
  }
}