import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"

export interface NewPasswordRecoveryInputModel {
    newPassword: string//    maxLength: 20    minLength: 6    New password    
    recoveryCode: string//    New password    
}
export interface PasswordRecoveryInputModel {
    /** Email of registered user */
    email: string//    pattern: ^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $       
}
export interface PasswordRecoveryBdModel {
    _id: string
    recoveryCode: string
    email: string//    pattern: ^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $       
}


export type PasswordRecoweryDocument = HydratedDocument<PasswordRecoveryBdModel>;

@Schema({ versionKey: false })
export class RecoweryPassword implements Omit<PasswordRecoveryBdModel, '_id'> {

    @Prop() recoveryCode: string
    @Prop() email: string//    pattern: ^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $  
}
export const passwordRecowerySchema = SchemaFactory.createForClass(RecoweryPassword);