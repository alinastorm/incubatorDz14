import { Controller, Get, Body, Post, Put, Param, Query, Delete, HttpCode } from '@nestjs/common';
import { UsePipes } from '@nestjs/common/decorators';
import { BlogIdValidatorPipe } from '../_commons/pipes/blogId.validation.pipe';
import { PostInput, PostView } from '../posts/post.model';
import { PostsService } from '../posts/posts.service';
import { Paginator, PaginatorQuery } from '../_commons/types/types';
import { BlogInput, BlogView } from './blog.model';
import { BlogsService } from './blogs.service';


@Controller('blogs')
export class BlogsController {
    constructor(
        protected blogsService: BlogsService,
        protected postsService: PostsService,
    ) { }

    @Get()
    readAllBlogsWithPaginator(@Query() queries: PaginatorQuery): Promise<Paginator<BlogView>> {
        return this.blogsService.readAllWithPaginator(queries)
    }
    @Post()
    addOneBlog(@Body() blog: BlogInput): Promise<BlogView> {
        return this.blogsService.addOne(blog)
    }
    @Get(":blogId/posts")
    @UsePipes(BlogIdValidatorPipe)
    readAllPostsFromBlog(
        @Param('blogId') blogId: string,
        @Query() queries: PaginatorQuery): Promise<Paginator<PostView>> {
        return this.postsService.readAllByBlog(blogId, queries)
    }
    @Post(":blogId/posts")
    addPostToBlog(
        @Param('blogId') blogId: string,
        @Body() post: PostInput) {
        return this.postsService.addOneToBlog(blogId, post)
    }
    @Get(":id")
    readOneBlog(
        @Param('id') blogId: string) {
        return this.blogsService.readOne(blogId)
    }
    @Put(":id") @HttpCode(204)
    updateOneBlog(
        @Param('id') blogId: string,
        @Body() blogUpdates: BlogInput) {
        return this.blogsService.updateOne(blogId, blogUpdates)
    }
    @Delete(":id") @HttpCode(204)
    deleteOneBlog(@Param('id') blogId: string) {
        return this.blogsService.deleteOne(blogId)
    }
}
