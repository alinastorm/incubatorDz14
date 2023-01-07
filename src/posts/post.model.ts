import { HydratedDocument, ObjectId, Query } from "mongoose"
import { LikeStatus } from "../comments/like.model"
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MaxLength, MinLength, IsString, IsMongoId } from 'class-validator';

//Types
export interface PostInput {
    title: string//    maxLength: 30
    shortDescription: string//    maxLength: 100
    content: string//maxLength: 1000
    blogId: string
}
export interface BlogPostInput {
    title: string//    maxLength: 30
    shortDescription: string//    maxLength: 100
    content: string//maxLength: 1000
}
export class PostInputDto implements PostInput {
    @IsString() @MinLength(1) @MaxLength(30) title: string//    maxLength: 30
    @IsString() @MinLength(1) @MaxLength(100) shortDescription: string//    maxLength: 100
    @IsString() @MinLength(1) @MaxLength(1000) content: string//maxLength: 1000
    @IsMongoId() @MinLength(1) blogId: string
}
export class PostInputUpdateDto implements PostInput {
    @IsString() @MaxLength(30) title: string//    maxLength: 30
    @IsString() @MaxLength(100) shortDescription: string//    maxLength: 100
    @IsString() @MaxLength(1000) content: string//maxLength: 1000
    @IsMongoId() blogId: string
}
export interface PostBd {
    _id: ObjectId
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string//TODO в дз не обязательный в интерфей
    extendedLikesInfo: ExtendedLikesInfoBd
}
export interface PostView {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string//TODO в дз не обязательный в интерфей
    extendedLikesInfo: ExtendedLikesInfoView
}
export interface ExtendedLikesInfoBd {
    /** Likes */
    likes: LikeDetails[],
    /** Deslike */
    deslike: LikeDetails[]
}
// export interface VirtualExtendedLikesInfoBd {
//     /** Virtual field */
//     dislikesCount: number
//     /** Virtual field */
//     likesCount: number
//     /** Virtual field */
//     myStatus: LikeStatus
//     /** Virtual field */
//     newestLikes: LikeDetails[] | []
// }
export interface ExtendedLikesInfoView {
    /** Total likes for parent item */
    /** Virtual prop Mongoose*/
    likesCount: number //	integer($int32) 
    /** Total dislikes for parent item */
    /** Virtual prop Mongoose*/
    dislikesCount: number //	integer($int32) 
    /** Send None if you want to unlike\undislike */
    /** Virtual prop Mongoose*/
    myStatus: LikeStatus //string Enum: Array[3]    
    /** Last 3 likes (status "Like") */
    /** Virtual prop Mongoose*/
    newestLikes: LikeDetails[] | []
}
export interface LikeDetails {
    /** Details about single like*/
    addedAt: string //	string($date - time)
    userId: string //	string    nullable: true,
    login: string //	string    nullable: true}
}
export type PostDocument = HydratedDocument<Post & { extendedLikesInfo: ExtendedLikesInfoBd }>;

@Schema({ versionKey: false })
export class LikeDetails implements LikeDetails {
    @Prop() addedAt: string //	string($date - time)
    @Prop() userId: string //	string    nullable: true,
    @Prop() login: string //	string    nullable: true} 
}
@Schema({ versionKey: false, _id: false })
export class ExtendedLikesInfo implements ExtendedLikesInfoBd {
    /** Likes */
    @Prop() likes: LikeDetails[]
    /** Deslike */
    @Prop() deslike: LikeDetails[]
}
export const ExtendedLikesInfoSchema = SchemaFactory.createForClass(ExtendedLikesInfo);

@Schema({ versionKey: false })
export class Post implements Omit<PostBd, '_id'> {
    // @Prop({ type: SchemaTypes.ObjectId }) _id: ObjectId //если объявить то при создании необходимо указать ObjectId если не указать MongoDb само генерирует
    @Prop() title: string
    @Prop() shortDescription: string
    @Prop() content: string
    @Prop() blogId: string
    @Prop() blogName: string
    @Prop() createdAt: string
    @Prop({ type: ExtendedLikesInfoSchema, default: () => ({}) }) extendedLikesInfo: ExtendedLikesInfo//такая конструкция дает дефолтное создание likes[] dislikes[] при создании Post
}
export const PostSchema = SchemaFactory.createForClass(Post);

function getMyStatus(userId: string) {
    if (!userId) return LikeStatus.None
    const likes = this.likes.filter((elem) => elem.userId === userId)
    const deslikes = this.deslike.filter((elem) => elem.userId === userId)
    const result: LikeStatus =
        (likes[0] ? LikeStatus.Like : undefined) ||
        (deslikes[0] ? LikeStatus.Dislike : undefined) ||
        LikeStatus.None
    return result
}
export function postViewDataMapper(value: PostDocument | null, userId?: string): PostView | null {

    return value ?
        {
            id: value._id.toString(), //?? value.id,//value.id так как пихаю в старый модуль repository а он мапит _id=>id
            title: value.title,
            shortDescription: value.shortDescription,
            content: value.content,
            blogId: value.blogId,
            blogName: value.blogName,
            createdAt: value.createdAt,//TODO в дз не обязательный в интерфей
            extendedLikesInfo: {
                dislikesCount: value.extendedLikesInfo.deslike.length,
                likesCount: value.extendedLikesInfo.likes.length,
                myStatus: getMyStatus(userId),
                newestLikes: value.extendedLikesInfo.likes.slice(0, 3),
            },
        } : null
}
export const postQueryHelpers = {
    myFind(this: Query<any, PostDocument> | null, name: string) {
        return this.find({ name });
    }
}
PostSchema.query = postQueryHelpers