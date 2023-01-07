import { ObjectId } from "mongoose"

export interface LikeInputModel {
    likeStatus: LikeStatus
}
export interface LikesBdModel {
    _id: ObjectId
    commentId: string
    userId: string
    myStatus: LikeStatus //	h11.LikeStatusstring Enum:    Array[3]

}
export interface LikeDetails {
    /** Details about single like*/
    addedAt: string //	string($date - time)
    userId: string //	string    nullable: true,
    login: string //	string    nullable: true}
}
export enum LikeStatus {
    None = "None",
    Like = "Like",
    Dislike = "Dislike"
}