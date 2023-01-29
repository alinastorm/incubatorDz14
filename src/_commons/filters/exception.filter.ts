import { ExceptionFilter, Catch, HttpException, ArgumentsHost, HttpStatus } from '@nestjs/common';

//перхватывает ошибки и мапит их под нужный формат
@Catch()
export class ExceptionMapperFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        if (exception instanceof HttpException) {
            const ctx = host.switchToHttp();
            const response = ctx.getResponse();
            const status = exception?.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

            response.status(status).json({
                //@ts-ignore
                errorsMessages: exception.response || null,
            });
        }
    }
}