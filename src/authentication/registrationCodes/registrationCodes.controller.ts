import { Controller, Post, Get, Body, Query, Res, HttpCode, Header } from "@nestjs/common";
import { RegistrationConfirmationCodeModel, RegistrationEmailResending } from "./registrationCode.model";
import { RegistrationCodeService } from "./registrationCodes.service";

@Controller("auth")

export class RegistrationController {

    constructor(
        private registrationService: RegistrationCodeService
    ) { }

    @Post('registration-confirmation')
    registrationConfirmationPOST(
        @Body() body: RegistrationConfirmationCodeModel
    ) {
        this.registrationService.confirmRegistrationCode(body)
    }

    @Get('registration-confirmation') @HttpCode(302) @Header('Location', 'https://ubt.by')
    registrationConfirmationGET(
        @Query('code') code: string
    ) {
        return this.registrationService.confirmRegistrationCode({ code })
    }

    @Post('registration-email-resending')
    registrationEmailResending(
        @Body() body: RegistrationEmailResending
    ) {
        return this.registrationService.resendRegistrationCode(body)
    }

}

