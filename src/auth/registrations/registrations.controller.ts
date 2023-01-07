import { Controller, Post } from "@nestjs/common";

@Controller("auth")

export class RegistrationController {

    @Post('registration')
    registration() { }

    @Post('registration-confirmation')
    registrationConfirmation() { }

    @Post('registration-email-resending')
    registrationEmailResending() { }

}

