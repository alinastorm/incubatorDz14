import { Injectable, HttpException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, } from 'class-validator';
import { Comment, CommentBdDocument } from '../../comments/comment.model';
import { HTTP_STATUSES } from '../types/types';


//Декоратор для валидации класса с помощью библиотеки Class-validator
export function isCommentByIdExist(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: CustomCommentIdValidation,
        });
    };
}

@ValidatorConstraint({ name: 'id', async: true })
@Injectable()
export class CustomCommentIdValidation implements ValidatorConstraintInterface {
    constructor(
        @InjectModel("Comment") private CommentModel: Model<CommentBdDocument>,
    ) { }

    async validate(userId: string): Promise<boolean> {
        return await this.CommentModel
            .find({ userId })
            .then((comment) => {
                if (!comment) {
                    throw new HttpException([{ message: "comment not found2", field: "id" }], HTTP_STATUSES.BAD_REQUEST_400)
                    // throw new UnprocessableEntityException('Email already exists');
                } else {
                    return true;
                }
            });
    }
}