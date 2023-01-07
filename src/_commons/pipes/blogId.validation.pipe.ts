import { Injectable, PipeTransform, ArgumentMetadata, HttpException } from "@nestjs/common"
import { BlogsService } from "../../blogs/blogs.service"
import { HTTP_STATUSES } from "../types/types"

//pipe проверки существования blog по id
//аналог middlewares
//вроде попроще чем Decorator
@Injectable()
export class BlogIdValidatorPipe implements PipeTransform {

    constructor(private blogService: BlogsService) { }

    async transform(value: any, metadata: ArgumentMetadata) {
        //если value это параметр с названием "blogId"
        if (metadata.type === 'param' && metadata.data === 'blogId') {
            const blogId = value
            const blog = await this.blogService.readOne(blogId)
            if (!blog) throw new HttpException([{ message: "blog not found", field: "blogId" }], HTTP_STATUSES.NOT_FOUND_404)
        }
        return value
    }
}