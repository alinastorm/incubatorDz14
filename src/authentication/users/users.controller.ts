import { Controller, Get, Body, Post, Param, Query, Delete, HttpCode } from '@nestjs/common';
import { UserViewDocument, UserInputDto, PaginatorUsersDto } from './user.model';
import { UsersService } from './users.service';
import { Cookies } from '../../_commons/decorators/cookies.decorator';
import { AuthService } from '../auths/auths.service';
//TODO
@Controller('users') export class UserController {

    constructor(
        protected userService: UsersService,
        protected authService: AuthService,
    ) { }

    @Get()
    async readAllUsers(
        @Query() queries: PaginatorUsersDto
    ) {
        return await this.userService.readAllWithPaginator(queries)
    }

    @Post()
    async addOneUser(
        @Body() body: UserInputDto
    ): Promise<UserViewDocument | any> {
        const { email, login, password } = body
        const user = await this.userService.addOne({ email, login }, true)
        await this.authService.addOne({ createdAt: user.createdAt, password, userId: user.id })
    }

    @Delete(":id") @HttpCode(204)
    async deleteOneUserById(@Param("id") id: string) {
        return await this.userService.deleteOne(id)
    }

 

}
