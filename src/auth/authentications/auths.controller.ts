import { Controller, Get, Post } from "@nestjs/common";

@Controller("auth")

export class AuthController {
    @Post('login')
    login() { }

    @Post('logout')
    logout() { }

    @Get('me')
    getUserInfo() { }
}

