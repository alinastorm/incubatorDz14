import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, MinLength, MaxLength, IsEmail } from "class-validator"


export interface Login {
    loginOrEmail: string
    password: string
}
export interface Registration {
    login: string
    password: string
    email: string
}
export class LoginDto {
    @IsNotEmpty() @IsString() @MinLength(3) @MaxLength(10) @ApiProperty()
    loginOrEmail: string /**  maxLength: 10 minLength: 3*/
    @IsNotEmpty() @IsString() @MinLength(6) @MaxLength(20) @ApiProperty()
    password: string // maxLength: 20 minLength: 6
}
export class RegistrationDto {
    @IsNotEmpty() @IsString() @MinLength(3) @MaxLength(10) @ApiProperty()
    login: string /**  maxLength: 10 minLength: 3*/
    @IsNotEmpty() @IsString() @MinLength(6) @MaxLength(20) @ApiProperty()
    password: string // maxLength: 20 minLength: 6
    @IsEmail() @ApiProperty({ default: "753464@gmail.com" })
    email: string // pattern: ^ [\w -\.] +@([\w -] +\.) +[\w -]{ 2, 4 } $ 
}