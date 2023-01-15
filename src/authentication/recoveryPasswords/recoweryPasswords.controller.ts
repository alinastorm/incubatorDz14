import { Controller, Post, Body, Get, HttpCode, Header, Query, Res } from "@nestjs/common";
import { Response } from "express";
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
        return this.recoveryPasswordsService.passwordRecowery(body)
    }

    /**
     * Confirm Password recovery
     * я добавил редирект на страницу входа
     * @param body 
     */
    @Post('new-password') @HttpCode(302) @Header('Location', 'https://ubt.by/sign-in')
    newPassword(
        @Body() body: NewPasswordRecoveryInputModel
    ) {
        return this.recoveryPasswordsService.newPassword(body)
    }

    /**
     * Мое.
     * Переход по ссылке с кодом из письма. Бек проверяет код если верный редиректит на страницу изменения пароля.
     * Фронт должен получить query и после проверки нового пароля отправить вместе с query
     * @param recoveryCode 
     */
    @Get('password-recovery')
    async resetPassword(
        @Query('recoveryCode') recoveryCode: string,
        @Res({ passthrough: true }) res: Response
    ) {
        try {
            await this.recoveryPasswordsService.checkRecoweryPassword(recoveryCode)
            res.set({ 'Location': `https://ubt.by/set-password?recoveryCode=${recoveryCode}` });
            res.status(302).send();
        } catch (error) {
            res.sendStatus(404)
        }
    }

}

