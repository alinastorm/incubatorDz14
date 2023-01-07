import { Controller, Post } from "@nestjs/common";

@Controller("auth")

export class RecoweryPasswordController {

    @Post('password-recovery')
    passwordRecowery() { }

    @Post('new-password')
    newPassword() { }
    
}

