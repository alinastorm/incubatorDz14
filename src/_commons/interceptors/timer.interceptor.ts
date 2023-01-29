import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap, take } from 'rxjs/operators';

//показывает как долго отрабатывает запрос use @UseInterceptors(LoggingTimeReqResInterceptor)
@Injectable()
export class LoggingTimeReqResInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        return next
            .handle()
            .pipe(
                tap(() => console.log(`req-res: ${Date.now() - now}ms`)),
            )

    }
}
