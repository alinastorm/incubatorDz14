import { Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from "mongoose";
import { LikeStatus } from "./like.model";
import { Comment, CommentBd, CommentBdDocument, CommentSchema, CommentView, CommentViewDataMapper, LikesInfoView } from "./comment.model";
import { Post, PostDocument } from '../posts/post.model';
import { User, UserBdDocument } from '../users/user.model';
import { HTTP_STATUSES, Paginator, PaginatorQueries } from '../_commons/types/types';
import { setPaginator } from '../_commons/helpers/paginator';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name) private CommentModel: Model<CommentBdDocument>,
        @InjectModel(Post.name) private PostModel: Model<PostDocument>,
        @InjectModel(User.name) private UserModel: Model<UserBdDocument>,
    ) { }
    async readOneByUserId(userId: string): Promise<CommentView> {
        CommentSchema.virtual(
            'likesInfo.myStatus',
            { ref: 'Likes', localField: '_id', foreignField: 'commentId', options: { match: { userId: userId } } })//TODO всунуть в метод .Метод в модель и вызывать создание виртуальных полей. 
            .get(function () { return LikeStatus.None })
        return await this.CommentModel.findOne({ userId }).populate('likesInfo.myStatus', 'myStatus')
    }
    async createOne(postId: string, userId: string, content: string) {
        const post = await this.PostModel.findById(postId)
        if (!post) throw new HttpException([{ message: "no post", field: "postId" }], HTTP_STATUSES.NOT_FOUND_404)

        const user = await this.UserModel.findById(userId)
        if (!user) throw new HttpException([{ message: "no userId", field: "userId" }], HTTP_STATUSES.UNAUTHORIZED_401)

        const { login: userLogin } = user
        const createdAt = new Date().toISOString()

        const likesInfo: LikesInfoView = { dislikesCount: 0, likesCount: 0, myStatus: LikeStatus.None }
        const element: Comment = { content, userId, userLogin, createdAt, postId, likesInfo }
        const idComment: string = (await this.CommentModel.create(element))._id.toString()
        {
            const comment = await this.CommentModel.findById(idComment).then(CommentViewDataMapper)
            if (!comment) throw new HttpException([{ message: "no post", field: "postId" }], HTTP_STATUSES.NOT_FOUND_404)
            return comment
        }
    }
    async readAllByPostIdWithPagination(postId: string, queries: PaginatorQueries, userId?: string): Promise<Paginator<CommentView>> {
        const filter: FilterQuery<CommentBd> = { postId}
        const { pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = -1, searchNameTerm } = queries

        if (searchNameTerm) filter['name'] = { name: { $regex: searchNameTerm, $options: 'i' } }
        // CommentSchema.virtual('likesInfo.myStatus', { ref: 'Likes', localField: '_id', foreignField: 'commentId', options: { match: { userId: userId } } })//TODO всунуть в метод .Метод в модель и вызывать создание виртуальных полей. 
        //     .get(function () { return LikeStatus.None })

        const count = await this.CommentModel.countDocuments(filter);
        const commentsModel = await this.CommentModel
            .find(filter)
            .populate('likesInfo.myStatus', 'myStatus')
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
            // .lean({ virtuals: true })

        const comments = commentsModel.map(CommentViewDataMapper)
        const result = setPaginator(comments, pageNumber, pageSize, count)
        return result
    }
}