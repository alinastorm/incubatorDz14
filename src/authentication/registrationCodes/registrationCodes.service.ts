import { HttpException, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { User, UserBd, UserBdDocument, UserView } from "../../authentication/users/user.model"
import { CryptoService } from "../../_commons/services/crypto-service"
import { HTTP_STATUSES } from "../../_commons/types/types"
import { Auth, AuthBdDocument, AuthView } from "../auths/auth.model"
import { v4 as uuidv4 } from "uuid";
import { add } from 'date-fns'
import { RegistrationCode, RegistrationCodeBd, RegistrationCodeDocument, RegistrationCodeInput, RegistrationCodeViewModel, RegistrationConfirmationCodeModel, RegistrationEmailResending } from "./registrationCode.model"
import { EmailService } from "../../_commons/services/email-service"
import { UsersService } from "../users/users.service"



@Injectable()
export class RegistrationCodeService {

    constructor(
        @InjectModel(RegistrationCode.name) private RegistrationCodeModel: Model<RegistrationCodeDocument>,
        private emailService: EmailService,
        private usersService: UsersService,

    ) { }

    async addOne(data: RegistrationCodeInput) {
        const { email, code, expirationDate, userId } = data
        const element: RegistrationCode = { email, code, expirationDate, userId }
        await this.RegistrationCodeModel.create(element)
    }
    async confirmRegistrationCode(data: RegistrationConfirmationCodeModel) {
        const { code } = data
        const codes = await this.RegistrationCodeModel.find({ code })

        if (!codes.length)  throw new HttpException([{ message: "code not found", field: "code" }], HTTP_STATUSES.BAD_REQUEST_400)
        // if (!codes.length)  throw new HttpException([{ message: "code not found", field: "code" }], HTTP_STATUSES.BAD_REQUEST_400)

        if (codes[0].expirationDate < new Date()) throw new HttpException([{ message: "code expired", field: "code" }], HTTP_STATUSES.BAD_REQUEST_400)

        const userId = codes[0].userId
        await this.usersService.updateOne(userId, { confirm: true })

        const codesUser = await this.RegistrationCodeModel.find({ userId })
        await Promise.all(codesUser.map(async ({ id }) => {
            await this.RegistrationCodeModel.deleteOne({ _id: id })
        }))
    }
    async resendRegistrationCode(data: RegistrationEmailResending) {
        const { email } = data
        const filterEmail: Partial<RegistrationCodeViewModel> = { email }
        const codes = await this.RegistrationCodeModel.find(filterEmail)
        if (!codes.length) throw new HttpException([{ message: "active code not found", field: "email" }], HTTP_STATUSES.BAD_REQUEST_400)

        //минимальное время откладывающее переотправку 
        // if (codes[0].restartTime < new Date()) {
        //     const result: APIErrorResult = { errorsMessages: [{ message: "wait 2 minutes", field: "email" }] }
        //     return res.status(400).json(result)
        // }

        const subject = "resend activation code"
        const code = uuidv4()
        const link = `${process.env.API_URL}/confirm-email?code=${code}`
        const message =
            `
            <h1>Resend confirmation code</h1>
            <p>To finish registration please follow the link below:
               <a href='${link}'>complete registration</a>
           </p>
        `
        try {
            this.emailService.sendEmail(email, subject, message)
        } catch (error) {
            throw new HttpException([{ message: "send mail error", field: "email" }], HTTP_STATUSES.BAD_REQUEST_400)
        }
        //время протухания кода регистрации
        const expirationDate = add(new Date(), {
            hours: 1,
            minutes: 3
        })
        // //минимальное время откладывающее переотправку 
        // const restartTime = add(new Date(), {
        //     minutes: 0
        // })
        const element: RegistrationCode = { email, code, expirationDate, userId: codes[0].userId }
        // const element: Omit<RegistrationCodeViewModel, 'id'> = { email, code, expirationDate, userId: codes[0].userId, restartTime }
        await this.RegistrationCodeModel.create(element)
    }

}