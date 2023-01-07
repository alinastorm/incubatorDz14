import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { MaxLength, MinLength, ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginatorUsers {
    @IsOptional() searchLoginTerm: string
    @IsOptional() searchEmailTerm: string
    @IsOptional() @Type(() => Number) pageNumber: number
    @IsOptional() @Type(() => Number) pageSize: number
    @IsOptional() sortBy: string
    @IsOptional() @Type(() => Number) sortDirection: 1 | -1 // asc, desc
}
export interface UserInput {
    login: string // maxLength: 10 minLength: 3
    password: string // maxLength: 20 minLength: 6
    email: string // pattern: ^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $
}
export interface UserView {
    id: string
    login: string
    email: string
    createdAt?: string //	TODO в дз не обязательный в интерфей
}
export interface UserBd {
    _id: string
    login: string
    email: string
    confirm: boolean //мое
    createdAt?: string //	TODO в дз не обязательный в интерфей
}
// export interface UsersSearchPaginationMongoDb {
//     /**Search term for user Login: Login should contains this term in any position
//      * Default value : null
//      */
//     searchLoginTerm: string
//     /**Search term for user Email: Email should contains this term in any position
//      * Default value : null
//      */
//     searchEmailTerm: string
//     /**PageNumber is number of portions that should be returned.
//      * Default value : 1
//      */
//     pageNumber: number
//     /**PageSize is portions size that should be returned
//      * Default value : 10
//      */
//     pageSize: number
//     /** Sorting term
//      * Default value : createdAt
//      */
//     sortBy: string
//     /** Sorting direction
//      * Default value: desc
//      */
//     sortDirection: 1 | -1
// }
export class UserInputDto {
    @IsNotEmpty() @IsString() @MinLength(3) @MaxLength(10) @ApiProperty()
    login: string /**  maxLength: 10 minLength: 3*/
    @IsNotEmpty() @IsString() @MinLength(6) @MaxLength(20) @ApiProperty()
    password: string // maxLength: 20 minLength: 6
    @IsEmail() @ApiProperty({ default: "753464@gmail.com" })
    email: string // pattern: ^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $ 
}
export type UserBdDocument = HydratedDocument<UserBd>;
export type UserViewDocument = HydratedDocument<UserView>;

@Schema({ versionKey: false })
export class User implements Omit<UserBd, '_id'> {

    @Prop({ required: true }) login: string
    @Prop() @IsEmail() email: string
    @Prop() confirm: boolean //мое
    @Prop() createdAt: string

}
export const UserSchema = SchemaFactory.createForClass(User);

export function userViewDataMapper(value: UserBdDocument | null): UserView | null {
    return value ?
        {
            id: value._id.toString(), //?? value.id,//value.id так как пихаю в старый модуль repository а он мапит _id=>id 
            login: value.login,
            email: value.email,
            createdAt: value.createdAt //	TODO в дз не обязательный в интерфей
        } : null
}

