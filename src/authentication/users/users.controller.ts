import { Controller, Get, Body, Post, Param, Query, Delete, HttpCode, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserViewDocument, UserInputDto, PaginatorUsersDto } from './user.model';
import { UsersService } from './users.service';
import { Cookies } from '../../_commons/decorators/cookies.decorator';
import { AuthService } from '../auths/auths.service';
import { BasicAuthGuard } from '../../_commons/guards/basic.auth.guard';
import { LoggerMiddleware } from '../../_commons/decorators/logger.decorator';
import { LoggingInterceptor } from '../../_commons/interceptors/Logger.interceptor';
import { LoggingTimeReqResInterceptor } from '../../_commons/interceptors/timer.interceptor';


//TODO
@Controller('users') export class UserController {

    constructor(
        protected userService: UsersService,
        protected authService: AuthService,
    ) { }

    @Get()
    @UseInterceptors(LoggingTimeReqResInterceptor)
    @UseInterceptors(LoggingInterceptor)
    @UseGuards(BasicAuthGuard)
    async readAllUsers(
        @Query() queries: PaginatorUsersDto
    ) {
        return await this.userService.readAllWithPaginator(queries)
    }

    @Post()
    @UseGuards(BasicAuthGuard)
    async addOneUser(
        @Body() body: UserInputDto
    ): Promise<UserViewDocument | any> {
        const { email, login, password } = body
        const user = await this.userService.addOne({ email, login }, true)
        await this.authService.addOne({ createdAt: user.createdAt, password, userId: user.id })
        return user
    }

    @Delete(":id")
    @UseInterceptors(LoggingTimeReqResInterceptor)
    @UseGuards(BasicAuthGuard)
    @HttpCode(204)
    async deleteOneUserById(@Param("id") id: string) {
        return await this.userService.deleteOne(id)
    }



}
