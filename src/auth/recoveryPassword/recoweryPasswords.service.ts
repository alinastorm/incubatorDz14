import { HttpException, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserBdDocument, UserView } from "src/users/user.model";
import { CryptoService } from "src/_commons/services/crypto-service";
import { EmailService } from "src/_commons/services/email-service";
import { HTTP_STATUSES } from "src/_commons/types/types";
import { v4 as uuidv4 } from "uuid";
import { Auth, AuthBd, AuthBdDocument, AuthView } from "../auths/auth.model";
import { PasswordRecoveryBdModel, RecoweryPassword, PasswordRecoweryDocument } from "./recoveryPassword.model";


@Injectable()
export class RecoveryPasswordsService {

    constructor(
        private emailService: EmailService,
        private cryptoService: CryptoService,
        @InjectModel(RecoweryPassword.name) private recoweryPassword: Model<PasswordRecoweryDocument>,
        @InjectModel(User.name) private UserModel: Model<UserBdDocument>,
        @InjectModel(Auth.name) private AuthModel: Model<AuthBdDocument>,

    ) { }

    async passwordRecowery({ email }) {
        //отправляем письмо
        const subject = "Password recovery"
        const recoveryCode = uuidv4()
        const link = `${process.env.API_URL}/auth/password-recovery?recoveryCode=${recoveryCode}'`
        const message =
            `
                <h1>Thank for your registration</h1>
                <p>To finish registration please follow the link below:
                   <a href='${link}'>recovery password</a>
               </p>
            `
        try {
            this.emailService.sendEmail(email, subject, message)
        } catch (error) {
            throw new HttpException([{ message: "send mail error", field: "email" }], HTTP_STATUSES.SERVER_ERROR_500)
        }
        //записываем  recoveryCode и email в бд
        const element: RecoweryPassword = { recoveryCode, email }
        await this.recoweryPassword.create(element)

    }
    async newPassword({ newPassword, recoveryCode }) {
        //проверка recovery code
        const passwordFilter: Partial<PasswordRecoveryBdModel> = { recoveryCode }
        const codes = await this.recoweryPassword.find(passwordFilter)
        if (!codes.length) throw new HttpException([{ message: "recoveryCode error", field: "recoveryCode" }], HTTP_STATUSES.BAD_REQUEST_400)
        //поиск usera по email
        const email = codes[0].email
        const userFilter: Partial<UserView> = { email }
        const users = await this.UserModel.find(userFilter)
        if (!users.length) throw new HttpException([{ message: "users not found", field: "email" }], HTTP_STATUSES.BAD_REQUEST_400)
        //запись нового хэша пароля
        const userId = users[0].id
        const authFilter: Partial<AuthBd> = { userId }
        const auths = await this.AuthModel.find(authFilter)
        const authId = auths[0].id
        const passwordHash = await this.cryptoService.generatePasswordHash(newPassword)
        const data: Pick<AuthView, "passwordHash"> = { passwordHash }
        await this.AuthModel.updateOne(authId, data)
    }
}