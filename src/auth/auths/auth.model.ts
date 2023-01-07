import { HydratedDocument, ObjectId, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';

// import { RepositoryMongoose } from "../../_common/abstractions/Repository/Repository-mongoose";


export interface LoginInput {
    loginOrEmail: string
    password: string
}
export interface LoginSuccessView {
    /** JWT access token */
    accessToken: string
}
export interface AuthInput {
    userId: string
    /**  maxLength: 20 minLength: 6 */
    passwordHash: string
}
export interface AuthView {
    id: string
    userId: string
    /**  maxLength: 20 minLength: 6 */
    passwordHash: string
    createdAt: string
}
export interface AuthBd {
    _id: ObjectId
    userId: string
    /**  maxLength: 20 minLength: 6 */
    passwordHash: string
    createdAt: string
}
export interface MeInput {
    /**Headers */
}
export interface MeView {
    email: string
    login: string
    userId: string
}
export type AuthDocument = HydratedDocument<AuthBd>;

@Schema()
export class Auth implements Omit<AuthBd, '_id'> {

    // @Prop({ type: SchemaTypes.ObjectId }) _id: ObjectId //если объявить то при создании необходимо указать ObjectId если не указать MongoDb само генерирует
    @Prop() userId: string
    @Prop() passwordHash: string
    @Prop() createdAt: string
}
export const AuthSchema = SchemaFactory.createForClass(Auth);

