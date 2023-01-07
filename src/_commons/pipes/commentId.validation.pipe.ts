import { Injectable, PipeTransform, ArgumentMetadata, HttpException } from "@nestjs/common"
import { CommentsService } from "../../comments/comments.service"
import { HTTP_STATUSES } from "../types/types"

//pipe проверки существования comment по id
//аналог middlewares
//вроде попроще чем Decorator
@Injectable()
export class CommentIdValidatorPipe implements PipeTransform {

    constructor(private commentService: CommentsService) { }

    async transform(value: any, metadata: ArgumentMetadata) {
        //если value это параметр с названием "id"
        if (metadata.type === 'param' && metadata.data === 'id') {
            const commentId = value
            const comment = await this.commentService.readOneByUserId(commentId)
            if (!comment) throw new HttpException([{ message: "comment not found", field: "id" }], HTTP_STATUSES.BAD_REQUEST_400)
        }
        return value
    }
}