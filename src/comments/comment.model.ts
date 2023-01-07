import { HydratedDocument, SchemaTypes } from "mongoose"
import { LikeStatus } from "../comments/like.model"
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MaxLength, MinLength, ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

//Input
export interface CommentInput {
    content: string //   maxLength: 300     minLength: 20
}
export class CommentInputDto {
    @IsNotEmpty() @IsString() @ApiProperty()
    content: string
}
export class readCommentByIdDto {
    @IsNotEmpty() @ApiProperty()
    @IsString()
    // @isCommentByIdExist() заменил на pipe в контроллере 
    id: string
}
//Bd
export interface CommentBd {

    _id: string //nullable: true
    content: string
    userId: string
    userLogin: string
    postId: string
    createdAt?: string//($date-time)
    likesInfo: LikesInfoBd
}
export interface LikesInfoBd {
    /** Total likes for parent item */
    likesCount: number //	integer($int32)    
    /** Total dislikes for parent item */
    dislikesCount: number //	integer($int32)    
    /** Send None if you want to unlike\undislike */
    // myStatus: LikeStatus //	h11.LikeStatusstring Enum:    Array[3]
}
//virtuals
export interface VirtualLikesInfoBd {
    /** Send None if you want to unlike\undislike */
    myStatus: LikeStatus //	h11.LikeStatusstring Enum:    Array[3]
}
//View
export interface CommentView {
    id: string //nullable: true //TODO может быть nullable
    content: string
    userId: string
    userLogin: string
    createdAt?: string//($date-time) 	//TODO в дз не обязательный в интерфей
    likesInfo: LikesInfoView
}
export interface LikesInfoView {
    /** Total likes for parent item */
    likesCount: number //	integer($int32)    
    /** Total dislikes for parent item */
    dislikesCount: number //	integer($int32)    
    /** Send None if you want to unlike\undislike */
    myStatus: LikeStatus //	h11.LikeStatusstring Enum:    Array[3]
}
//Mongoose
export type CommentBdDocument = HydratedDocument<CommentBd & { likesInfo: VirtualLikesInfoBd }>;
export type CommentViewDocument = HydratedDocument<CommentView>;

@Schema({ versionKey: false })
export class LikesInfo implements LikesInfoBd {
    /** Total likes for parent item */
    likesCount: number //	integer($int32)    
    /** Total dislikes for parent item */
    dislikesCount: number //	integer($int32)    
    /** Send None if you want to unlike\undislike */
    // @Prop({ type: SchemaTypes.ObjectId, ref: 'Likes' }) myStatus: LikeStatus //	h11.LikeStatusstring Enum:    Array[3]
}
export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
@Schema({ versionKey: false })
export class Comment implements Omit<CommentBd, '_id'> {

    @Prop() content: string
    @Prop() userId: string
    @Prop() userLogin: string
    @Prop() postId: string
    @Prop() createdAt?: string//($date-time) 	//TODO в дз не обязательный в интерфей
    @Prop() likesInfo: LikesInfo//id

}
export const CommentSchema = SchemaFactory.createForClass(Comment);

export function CommentViewDataMapper(model: CommentBdDocument | null): CommentView | null {
    return model ?
        {
            id: model._id.toString(), //?? value.id,//value.id так как пихаю в старый модуль repository а он мапит _id=>id 
            content: model.content,
            userId: model.userId,
            userLogin: model.userLogin,
            createdAt: model.createdAt,//($date-time) 	//TODO в дз не обязательный в интерфей
            likesInfo: model.likesInfo,
        } : null
}
