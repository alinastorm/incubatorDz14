import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Blog, BlogBd, BlogDocument, BlogView } from '../blogs/blog.model';
import { LikeStatus } from '../comments/like.model';
import { setPaginator } from '../_commons/helpers/paginator';
import { HTTP_STATUSES, Paginator, PaginatorQueries } from '../_commons/types/types';
import { ExtendedLikesInfoBd, Post, PostBd, PostDocument, PostInput, PostView, BlogPostInput, postQueryHelpers, postViewDataMapper } from './post.model';

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Post.name) private PostModel: Model<PostDocument, typeof postQueryHelpers>,
        @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
    ) { }
    async readAllWithPaginator(query: PaginatorQueries): Promise<Paginator<PostView>> {

        const { pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = -1, searchNameTerm } = query
        let filter: FilterQuery<PostBd> = {}
        if (searchNameTerm) filter = { name: { $regex: searchNameTerm, $options: 'i' } }
        const count = await this.PostModel.countDocuments(filter);
        const userId = null
        const postsModels = await this.PostModel
            .find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })

        const posts = postsModels.map((item) => { return postViewDataMapper(item) })
        const result = setPaginator(posts, pageNumber, pageSize, count)
        return result
    }
    async addOne(data: PostInput): Promise<PostView> {

        const { content, shortDescription, title, blogId } = data
        const createdAt = new Date().toISOString()
        const blog = await this.BlogModel.findById(blogId)
        
        if (!blog) {
            throw new HttpException([{ message: "blog not found", field: "blog" }], HTTP_STATUSES.NOT_FOUND_404)
        }
        const { name: blogName } = blog
        const extendedLikesInfo: ExtendedLikesInfoBd = {
            likes: [],
            deslike: []
        }
        const elementPost: Post = { blogId, blogName, content, createdAt, extendedLikesInfo, shortDescription, title }

        const post = await this.PostModel.create(elementPost).then(postViewDataMapper)
        return post
    }
    async addOneToBlog(blogId: string, data: BlogPostInput): Promise<PostView> {

        const { content, shortDescription, title } = data
        const createdAt = new Date().toISOString()
        const blog = await this.BlogModel.findById(blogId)
        
        if (!blog) {
            throw new HttpException([{ message: "blog not found", field: "blog" }], HTTP_STATUSES.NOT_FOUND_404)
        }
        const { name: blogName } = blog
        const extendedLikesInfo: ExtendedLikesInfoBd = {
            likes: [],
            deslike: []
        }
        const elementPost: Post = { blogId, blogName, content, createdAt, extendedLikesInfo, shortDescription, title }
        this.PostModel.schema.virtual('extendedLikesInfo.myStatus').get(function () {
            return LikeStatus.None;
        });

        const post = await this.PostModel.create(elementPost).then(postViewDataMapper)
        return post
    }
    async readOne(postId: string, userId?: string) {
        const post = await this.PostModel.findById(postId).then((item) => { return postViewDataMapper(item, userId) })

        if (!post) {
            throw new HttpException([{ message: "post not found", field: "postId" }], HTTP_STATUSES.NOT_FOUND_404)
        }
        return post
    }
    async updateOne(postId: string, postUpdates: PostInput) {
        const result = await this.PostModel.updateOne({ _id: postId }, postUpdates)
        return result.modifiedCount === 1
    }
    async deleteOnePost(postId: string) {
        const result = await this.PostModel.deleteOne({ _id: postId })
        return result.deletedCount === 1
    }
    async readAllByBlog(blogId: string, queries: PaginatorQueries): Promise<Paginator<PostView>> {

        const { pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = -1, searchNameTerm } = queries

        const filter: FilterQuery<BlogBd> = { blogId }
        if (searchNameTerm) filter['name'] = { name: { $regex: searchNameTerm, $options: 'i' } }
        const count = await this.PostModel.countDocuments(filter);
        const postsModel = await this.PostModel
            .find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
        const posts = postsModel.map((item) => { return postViewDataMapper(item) })
        const result = setPaginator(posts, pageNumber, pageSize, count)
        return result
    }
}
