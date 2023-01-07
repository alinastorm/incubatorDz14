import { Controller, Post } from "@nestjs/common";

@Controller("auth")

export class TokensController {
    
    @Post('prefresh-token')
    prefreshToken() { }

}

