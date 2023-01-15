import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { CryptoService } from "../../_commons/services/crypto-service"
import { Auth, AuthBdDocument, AuthInput } from "./auth.model"




@Injectable()
export class AuthService {

    constructor(
        @InjectModel(Auth.name) private AuthModel: Model<AuthBdDocument>,
        private cryptoService: CryptoService
    ) { }

    async readAll(filter: Partial<Auth>) {
        return await this.AuthModel.find({ filter }).lean()
    }
    async readOne(id: string) {
        return await this.AuthModel.find({ _id: id })
    }
    async addOne(data: AuthInput) {
        const { createdAt, password, userId } = data
        const passwordHash = await this.cryptoService.generatePasswordHash(password)

        const element: Auth = { createdAt, passwordHash, userId }
        return await this.AuthModel.create(element)
    }
    async updateOne(id: string, data) {
        return await this.AuthModel.updateOne({ _id: id }, data)
    }
    async deleteOne(id: string) {
        return await this.AuthModel.deleteOne({ _id: id })
    }

}
