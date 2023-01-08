import { Controller, Post, Body } from "@nestjs/common";
import { NewPasswordRecoveryInputModel, PasswordRecoveryInputModel } from "./recoveryPassword.model";
import { RecoveryPasswordsService } from "./recoweryPasswords.service";


@Controller("auth")

export class RecoweryPasswordController {

    constructor(
        private recoveryPasswordsService: RecoveryPasswordsService
    ) { }

    /**
     * Password recovery via Email confirmation. Email should be sent with RecoveryCode inside
     * @param body 
     */
    @Post('password-recovery')
    passwordRecowery(
        @Body() body: PasswordRecoveryInputModel
    ) {
        this.recoveryPasswordsService.passwordRecowery(body)
    }

    /**
     * Confirm Password recovery
     * @param body 
     */
    @Post('new-password')
    newPassword(
        @Body() body: NewPasswordRecoveryInputModel        
    ) { 
        this.recoveryPasswordsService.newPassword(body)

    }

}

