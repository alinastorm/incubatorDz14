import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


/** Device session */
export interface DeviceSessionView {
    /** IP address of device during signing in */
    ip: string
    /** Device name: for example Chrome 105 (received by parsing http header "user-agent") */
    title: string
    /** Date of the last generating of refresh/access tokens */
    lastActiveDate: string
    /** Id of connected device session */
    deviceId: string

}
export interface DeviceSessionBd {
    /** ObjectId */
    _id: string
    /** IP address of device during signing in */
    ip: string
    /** Device name: for example Chrome 105 (received by parsing http header "user-agent") */
    title: string
    /** Date of the last generating of refresh/access tokens */
    lastActiveDate: string
    /** Id of connected device session */
    deviceId: string
    /**мое юзер так как нужен поиск сессий пользователя */
    userId: string
}
export type DeviceSessionDocument = HydratedDocument<DeviceSessionBd>;

@Schema({ versionKey: false })
export class DeviceSession implements Omit<DeviceSessionBd, '_id'> {

    /** IP address of device during signing in */
    @Prop() ip: string
    /** Device name: for example Chrome 105 (received by parsing http header "user-agent") */
    @Prop() title: string
    /** Date of the last generating of refresh/access tokens */
    @Prop() lastActiveDate: string
    /** Id of connected device session */
    @Prop() deviceId: string
    /**мое юзер так как нужен поиск сессий пользователя */
    @Prop() userId: string

}
export const deviceSessionSchema = SchemaFactory.createForClass(DeviceSession);

export function deviceSessionMapper(value: DeviceSessionDocument | null): DeviceSessionView | null {

    return value ?
        {
            ip: value.ip,
            title: value.title,
            lastActiveDate: value.lastActiveDate,
            deviceId: value.deviceId,
        } : null
}