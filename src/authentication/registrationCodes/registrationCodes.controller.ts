import { Controller, Post, Body } from "@nestjs/common";
import { UserInput, UserInputDto } from "src/authentication/users/user.model";
import { RegistrationConfirmationCodeModel, RegistrationEmailResending } from "./registrationCode.model";
import { RegistrationCodeService } from "./registrationCodes.service";

@Controller("auth")

export class RegistrationController {

    constructor(
        private registrationService: RegistrationCodeService
    ) { }

  

    @Post('registration-confirmation')
    registrationConfirmation(
        @Body() body: RegistrationConfirmationCodeModel
    ) {
        this.registrationService.confirmRegistrationCode(body)
    }

    @Post('registration-email-resending')
    registrationEmailResending(
        @Body() body: RegistrationEmailResending
    ) {
        this.registrationService.resendRegistrationCode(body)
    }

}

