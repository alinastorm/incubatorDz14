import { Controller, Get, Body, Post, Param, Query, Res, Delete, HttpCode } from '@nestjs/common';
import { UserInput, UserViewDocument, userViewDataMapper, UserInputDto, PaginatorUsers } from './user.model';
import { UserService } from './users.service';
import { Response } from 'express';
import { PaginatorQuery } from '../_commons/types/types';
//TODO
@Controller('users') export class UserController {

    constructor(protected userService: UserService) { }

    @Get()
    async readAllUsers(
        @Query() queries: PaginatorUsers
    ) {     
        return await this.userService.readAllWithPaginator(queries)
    }

    @Post()
    async addOneUser(@Body() user: UserInputDto): Promise<UserViewDocument | any> {
        return await this.userService.addOne(user)
    }

    @Delete(":id") @HttpCode(204)
    async deleteOneUserById(@Param("id") id: string) {
        await this.userService.deleteOne(id)
    }

}
