import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap, take } from 'rxjs/operators';

//перехватывает response data так как filter и middleware не имеют доступа к resp
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        return next
            .handle()
            .pipe(
                tap((data) => console.log(`data:`, JSON.stringify(data))),
            )

    }
}
