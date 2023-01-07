import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { setPaginator } from '../_commons/helpers/paginator';
import { HTTP_STATUSES, Paginator, PaginatorQueries } from '../_commons/types/types';
import { Blog, BlogBd, BlogDocument, BlogInput, BlogView, BlogViewDataMapper } from './blog.model';

@Injectable()
export class BlogsService {

    constructor(
        @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
        // @InjectModel(Post.name) private PostModel: Model<PostBdDocument>,
    ) { }

    async readAllWithPaginator(queries: PaginatorQueries): Promise<Paginator<BlogView>> {
        const { pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = -1, searchNameTerm } = queries
        let filter: FilterQuery<BlogBd> = {}
        if (searchNameTerm) filter = { name: { $regex: searchNameTerm, $options: 'i' } }

        const count = await this.BlogModel.countDocuments(filter);
        const blogsModel = await this.BlogModel
            .find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
            // .lean({ virtuals: true })

        // const docCount = await this.BlogModel.countDocuments()
        const blogs = blogsModel.map(BlogViewDataMapper)
        const result = setPaginator(blogs, pageNumber, pageSize, count)
        return result
    }
    async addOne(data: BlogInput): Promise<BlogView> {
        const { name, websiteUrl, description } = data
        const createdAt = new Date().toISOString()
        const elementBlog: Blog = { createdAt, name, websiteUrl, description }
        const blog = await this.BlogModel.create(elementBlog).then(BlogViewDataMapper)
        return blog
    }
    async readOne(blogId: string) {
        const result = await this.BlogModel.findById(blogId).then(BlogViewDataMapper)
        if (!result) throw new HttpException([{ message: "blog not found", field: "blogId" }], HTTP_STATUSES.NOT_FOUND_404)
        return result
    }
    async updateOne(blogId: string, data: BlogInput) {
        const blog = await this.BlogModel.findById(blogId)
        if (!blog) throw new HttpException([{ message: "blog not found", field: "id" }], HTTP_STATUSES.NOT_FOUND_404)

        //обновляем myLike
        const elementUpdate: Partial<BlogBd> = data
        const result = await this.BlogModel.updateOne({ _id: blogId }, elementUpdate, { upsert: false })
        return result
    }
    async deleteOne(blogId: string) {
        const blog = await this.BlogModel.findById(blogId)
        if (!blog) throw new HttpException([{ message: "blog not found", field: "blogId" }], HTTP_STATUSES.NOT_FOUND_404)
        const result = await this.BlogModel.deleteOne({ _id: blogId })
        return result.deletedCount === 1
    }
}
