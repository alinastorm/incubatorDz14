import { Controller, Get, Body, Post, Put, Param, Query, Res, Delete, HttpCode, UsePipes, Logger } from '@nestjs/common';
import { CommentsService } from '../comments/comments.service';
import { PostIdValidatorPipe } from '../_commons/pipes/postId.validation.pipe';
import { PaginatorQuery } from '../_commons/types/types';
import { PostInput, PostInputDto, PostInputUpdateDto } from './post.model';
import { PostsService } from './posts.service';


@Controller('posts')
export class PostsController {

    constructor(private postService: PostsService, private commentsService: CommentsService) { }

    @Get(":postId/comments")
    readAllCommentsfromPost(
        @Param("postId") postId: string,
        @Query() queries: PaginatorQuery) {
        return this.commentsService.readAllByPostIdWithPagination(postId, queries)
    }

    @Get()
    readAllPosts(@Query() query: PaginatorQuery) {
        return this.postService.readAllWithPaginator(query)
    }

    @Post()
    addOnePost(
        @Body() post: PostInputDto,
    ) {
        // new Logger().log(`POST/posts`)
        return this.postService.addOne(post)
    }

    @Get(":id")
     readOnePost(
        @Param('id') postId: string,
    ) {
        return this.postService.readOne(postId)
    }

    @Put(":id") @UsePipes(PostIdValidatorPipe) @HttpCode(204)
    updateOnePost(
        @Param('id') postId: string,
        @Body() postUpdates: PostInputUpdateDto
    ) {
        return this.postService.updateOne(postId, postUpdates)
    }

    @Delete(":id") @UsePipes(PostIdValidatorPipe) @HttpCode(204)
    deleteOnePost(
        @Param('id') postId: string
    ) {
        // new Logger().log(`Delete/posts/${postId}`)
        return this.postService.deleteOnePost(postId)
    }

}
