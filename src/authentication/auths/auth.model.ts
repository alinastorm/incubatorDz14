import { HydratedDocument, ObjectId } from 'mongoose';
import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';



export interface AuthInput {
    userId: string
    password: string
    createdAt: string
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


export type AuthBdDocument = HydratedDocument<AuthBd>;

@Schema()
export class Auth implements Omit<AuthBd, '_id'> {

    // @Prop({ type: SchemaTypes.ObjectId }) _id: ObjectId //если объявить то при создании необходимо указать ObjectId если не указать MongoDb само генерирует
    @Prop() userId: string
    @Prop() passwordHash: string
    @Prop() createdAt: string
}
export const AuthSchema = SchemaFactory.createForClass(Auth);

