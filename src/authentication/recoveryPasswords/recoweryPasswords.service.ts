import { HttpException, Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CryptoService } from "../../_commons/services/crypto-service";
import { EmailService } from "../../_commons/services/email-service";
import { HTTP_STATUSES } from "../../_commons/types/types";
import { v4 as uuidv4 } from "uuid";
import { Auth, AuthBd, AuthBdDocument, AuthView } from "../auths/auth.model";
import { AuthService } from "../auths/auths.service";
import { UsersService } from "../users/users.service";
import { PasswordRecoveryBdModel, RecoweryPassword, PasswordRecoweryDocument } from "./recoveryPassword.model";


@Injectable()
export class RecoveryPasswordsService {

    constructor(
        private emailService: EmailService,
        private usersService: UsersService,
        private cryptoService: CryptoService,
        private authService: AuthService,
        @InjectModel(RecoweryPassword.name) private recoweryPassword: Model<PasswordRecoweryDocument>,
    ) { }

    async passwordRecowery({ email }) {
        //отправляем письмо
        const subject = "Password recovery"
        const recoveryCode = uuidv4()
        const link = `${process.env.API_URL}/auth/password-recovery?recoveryCode=${recoveryCode}'`
        // const link = `${process.env.API_URL}/auth/password-recovery?recoveryCode=${recoveryCode}'`
        const message =
            `
                <h1>Password recovery</h1>
                <p>To finish password recowery please follow the link below:
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
    /** мое */
    async checkRecoweryPassword(recoveryCode: string) {
        //проверка recovery code
        const passwordFilter: Partial<PasswordRecoveryBdModel> = { recoveryCode }
        const codes = await this.recoweryPassword.find(passwordFilter)
        if (!codes.length) throw new HttpException([{ message: "recoveryCode error", field: "recoveryCode" }], HTTP_STATUSES.BAD_REQUEST_400)
        //поиск usera по email
        const email = codes[0].email
        const users = await this.usersService.readAll({ email })
        if (!users.length) throw new HttpException([{ message: "users not found", field: "email" }], HTTP_STATUSES.BAD_REQUEST_400)
        // //отправка страницы
        // const html = `
        // <div style="display: flex; justify-content: center; align-items: center; flex-direction: column; height: 100vh;">
        // <label>New Password:</label>
        // <input type="password" name="password" id="password" style="margin: 10px 0;"/>
        // <label>Confirm Password:</label>
        // <input type="password" name="confirmPassword" id="confirmPassword" style="margin: 10px 0;"/>
        // <button style="margin: 10px 0;" onclick="checkPassword()">Submit</button>
        // </div>      
        // <script>
        // function checkPassword() {
        //     const password = document.getElementById("password").value;
        //     const confirmPassword = document.getElementById("confirmPassword").value;
        //     const recoveryCode = getQueryParameter("recoveryCode");
        //     if (password !== confirmPassword) {
        //         alert("Passwords do not match.");
        //         return;
        //     }
        //     fetch('${process.env.API_URL}/auth/new-password', {
        //         method: 'POST',
        //         headers: {
        //             'Accept': 'application/json, text/plain, */*',
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({ newPassword: password, recoveryCode: recoveryCode })
        //     })

        // }
        // function getQueryParameter(name) {
        //     var urlParams = new URLSearchParams(window.location.search);
        //     return urlParams.get(name);
        // }        
        // </script>
        // `
        // return html
    }

    async newPassword({ newPassword, recoveryCode }) {
        //проверка recovery code
        const passwordFilter: Partial<PasswordRecoveryBdModel> = { recoveryCode }
        const codes = await this.recoweryPassword.find(passwordFilter)
        if (!codes.length) throw new HttpException([{ message: "recoveryCode error", field: "recoveryCode" }], HTTP_STATUSES.BAD_REQUEST_400)
        //поиск usera по email
        const email = codes[0].email
        const users = await this.usersService.readAll({ email })
        if (!users.length) throw new HttpException([{ message: "users not found", field: "email" }], HTTP_STATUSES.BAD_REQUEST_400)
        //запись нового хэша пароля
        const userId = users[0].id
        const auths = await this.authService.readAll({ userId })
        const authId = auths[0].id
        const passwordHash = await this.cryptoService.generatePasswordHash(newPassword)
        await this.authService.updateOne(authId, { passwordHash })
    }
}