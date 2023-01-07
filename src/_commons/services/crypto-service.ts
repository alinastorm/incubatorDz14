
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


@Injectable()
export class CryptoService {

    async generatePasswordHash(password: string, salt?: string) {
        const passwordSalt = salt || await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, passwordSalt)
        return passwordSalt + ":" + passwordHash
    }
    async checkPasswordByHash(passwordHash: string, password: string) {
        const [salt] = passwordHash.split(':')
        return passwordHash === await this.generatePasswordHash(password, salt)
    }

}
