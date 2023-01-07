import { ValidationPipe, HttpException } from "@nestjs/common"
import { HTTP_STATUSES } from "../types/types"

//ValidationPipe использует либу Class validator для проверки типа согласно указанных в классе декораторов
//данный pipe нужен для форматирования ответа сервера при ошибке валидации классов библиотекой Class validator    
export default new ValidationPipe(
    {
        stopAtFirstError: true,//по одному полю может быть много проверок, остановится на первой
        whitelist: true,//только поля из схемы. Если true, валидатор удалит проверенный (возвращенный) объект любых свойств, которые не используют декораторы проверки.
        forbidNonWhitelisted: true,//Если true, вместо удаления свойств, не включенных в белый список, валидатор выдаст исключение.
        forbidUnknownValues: false,//Если true, попытки проверить неизвестные объекты немедленно завершатся неудачно.
        // transform:true,// запускает трансформацию запроса к указанному примитивному типу
        exceptionFactory: (errors) => {//формат овывода ошибки
            const errorsForResponse = []
            errors.forEach((e) => {
                const constraintsKeys = Object.keys(e.constraints)
                constraintsKeys.forEach((ckey) => {
                    errorsForResponse.push({
                        message: e.constraints[ckey],
                        field: e.property
                    })
                })
            })
            return new HttpException(errorsForResponse, HTTP_STATUSES.BAD_REQUEST_400)
        }
    }
)