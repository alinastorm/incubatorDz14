export interface AccessTokenPayload {
    userId: string
}
export interface RefreshTokenPayload {
    /** UserId */
    userId: string
    /** Id of connected device session */
    deviceId: string
}
