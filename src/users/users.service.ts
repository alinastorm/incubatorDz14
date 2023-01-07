import { HttpException, Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserBd, UserBdDocument, UserInput, userViewDataMapper, UserView, PaginatorUsers } from './user.model';
import { CallbackError, FilterQuery, Model, ObjectId } from 'mongoose';
import { CryptoService } from '../_commons/services/crypto-service';
import { HTTP_STATUSES, Paginator, PaginatorQueries } from '../_commons/types/types';
import { Auth, AuthDocument, AuthView } from '../auth/authentications/auth.model';
import { setPaginator } from '../_commons/helpers/paginator';


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<UserBdDocument>,
        @InjectModel(Auth.name) private AuthModel: Model<AuthDocument>,
        private cryptoService: CryptoService,
    ) { }

    async readAll(loginOrEmail: string) {
        let filter: FilterQuery<UserBd> = {}
        if (loginOrEmail) {
            filter = { $or: [] }
             filter.$or.push({ email: { $regex: loginOrEmail, $options: 'i' } })
             filter.$or.push({ login: { $regex: loginOrEmail, $options: 'i' } })
        }
        const users = await this.UserModel.find(filter)
        return users.map(userViewDataMapper)
    }
    async readAllWithPaginator(query: PaginatorUsers): Promise<Paginator<UserView>> {

        const { pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = -1, searchLoginTerm, searchEmailTerm } = query
        let filter: FilterQuery<UserBd> = {}
        if (searchEmailTerm || searchLoginTerm) {
            filter = { $or: [] }
            if (searchEmailTerm) filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } })
            if (searchLoginTerm) filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' } })
        }

        // if (searchLoginTerm) filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' } })
        // if (searchNameTerm) filter = { login: { $regex: searchNameTerm, $options: 'i' } }
        const count = await this.UserModel.countDocuments(filter);
        const postsModel = await this.UserModel
            .find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
        // .lean({ virtuals: true })

        const posts = postsModel.map(userViewDataMapper)
        const result = setPaginator(posts, pageNumber, pageSize, count)
        return result
    }
    async addOne({ email, login, password }: UserInput): Promise<UserView | HttpException> {
        //проверка уникальный login
        const usersRegistered = await this.UserModel.find({ login }).lean()
        if (usersRegistered.length) throw new HttpException([{ message: "login exist", field: "login" }], HTTP_STATUSES.BAD_REQUEST_400)

        const createdAt = new Date().toISOString()
        const elementUser: User = { email, login, createdAt, confirm: true }
        const user = await this.UserModel.create(elementUser).then(userViewDataMapper)
        const userId = user.id
        const passwordHash = await this.cryptoService.generatePasswordHash(password)
        const elementAuth: Omit<AuthView, "id"> = { passwordHash, userId, createdAt }
        await this.AuthModel.create(elementAuth)
        return user
    }
    async deleteOne(id: string) {
        const result = (await this.UserModel.deleteOne({ _id: id })).deletedCount === 1
        if (!result) throw new HttpException([{ message: "user not found", field: "id" }], HTTP_STATUSES.NOT_FOUND_404)
    }
}
