import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"




export interface RegistrationCodeInput {
    userId: string
    email: string
    code: string
    expirationDate: Date
}
export interface RegistrationCodeViewModel {
    id: string
    userId: string
    email: string
    code: string
    expirationDate: Date
    // restartTime: Date
}
export interface RegistrationCodeBd {
    _id: string
    userId: string
    email: string
    code: string
    expirationDate: Date
    // restartTime: Date
}
export interface RegistrationConfirmationCodeModel {
    /**Code that be sent via Email inside link */
    code: string
}

export interface RegistrationEmailResending {
    /**Email of already registered but not confirmed user */
    email: string //    pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$  
}


export type RegistrationCodeDocument = HydratedDocument<RegistrationCodeBd>;

@Schema({ versionKey: false })
export class RegistrationCode implements Omit<RegistrationCodeBd, '_id'> {

    @Prop() userId: string
    @Prop() email: string
    @Prop() code: string
    @Prop() expirationDate: Date
}
export const registrationCodeSchema = SchemaFactory.createForClass(RegistrationCode);