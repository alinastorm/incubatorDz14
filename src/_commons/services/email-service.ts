import { Injectable, Logger } from "@nestjs/common"
import { Transporter } from "nodemailer";
import Mail from "nodemailer/lib/mailer"
import SendmailTransport from "nodemailer/lib/sendmail-transport";




@Injectable()
export class EmailService {

    private transporter: Transporter<SendmailTransport.SentMessageInfo>
    constructor() {
        import('nodemailer').then((nodemailer) => {
            this.transporter = nodemailer.createTransport({
                //и так работает
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                }
                // и так работает
                // port: 587,
                // host: "smtp.gmail.com",
                // auth: {
                //     user: process.env.SMTP_USER,
                //     pass: process.env.SMTP_PASSWORD,
                // },
                // secure: false,
            })
            // const logger = new Logger('HELP');
            // logger.log(this.transporter)
            this.connect()
        })
    }
    async connect() {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            const logger = new Logger('EmailService');
            logger.log("EmailService no login or pass")
        }
        await this.verify()
    }
    async verify() {
        await new Promise((resolve, reject) => {
            // verify connection configuration
            this.transporter.verify(function (error, success) {
                if (error) {
                    const logger = new Logger('EmailService');
                    logger.log(error)
                    reject(error);

                } else {
                    const logger = new Logger('EmailService');
                    logger.log("EmailService started")
                    resolve(success);
                }
            });
        });
    }
    async sendEmail(to: string, subject: string, message: string) {
        const mailOptions: Mail.Options = {
            from: `${process.env.APP_VERSION} <${process.env.SMTP_USER}>`,
            to,
            subject,
            text: '',
            html: message
        }


        await new Promise((resolve, reject) => {
            // send mail
            this.transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    const logger = new Logger('EmailService');
                    logger.log(err)
                    reject(err);
                } else {
                    const logger = new Logger('EmailService');
                    logger.log('email sent')
                    resolve(info);
                }
            });
        });

    }
    stop() {
        const logger = new Logger('EmailService');
        logger.log('EmailService stoped')
        this.transporter.close()
    }
    // sendActivationMail(to: string | Mail.Address | (string | Mail.Address)[] | undefined, link: string) {
    //     const mailOptions: Mail.Options = {
    //         from: `${process.env.APP_VERSION} <${process.env.SMTP_USER}>`,
    //         to,
    //         subject: `Активация аккаунта ` + process.env.API_URL,
    //         text: '',
    //         html:
    //             `<div>
    //              <h1>Добро пожаловать</h1>
    //              <h1>Для активации аккаунта необходимо перейти по ссылке:</h1>
    //              <a href = "${link}">Активировать аккаунт</a>
    //              </div>
    //              `
    //     }

    //     const info = this.transporter.sendMail(mailOptions, (err) => { })
    // }
}
