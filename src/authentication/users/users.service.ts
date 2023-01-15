import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserBd, UserBdDocument, userViewDataMapper, UserView, PaginatorUsersDto, UserInfo, UserInput } from './user.model';
import { FilterQuery, Model } from 'mongoose';
import { HTTP_STATUSES, Paginator } from '../../_commons/types/types';
import { setPaginator } from '../../_commons/helpers/paginator';
import { JwtTokenService } from '../../_commons/services/jwtToken-service';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<UserBdDocument>,
        private jwtTokenService: JwtTokenService,
    ) { }

    async readAll(filter: FilterQuery<UserBd>) { 
        const users = await this.UserModel.find(filter).lean()
        return users
    }
    async readAllWithPaginator(query: PaginatorUsersDto): Promise<Paginator<UserView>> {

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
    async addOne(data: UserInput, confirm: boolean): Promise<UserView> {
        const { email, login } = data
        //проверка уникальный login
        const usersRegistered = await this.UserModel.find({ login }).lean()
        if (usersRegistered.length) throw new HttpException([{ message: "login exist", field: "login" }], HTTP_STATUSES.BAD_REQUEST_400)

        const createdAt = new Date().toISOString()
        const elementUser: User = { email, login, createdAt, confirm }
        const user = await this.UserModel.create(elementUser).then(userViewDataMapper)

        return user
    }
    async deleteOne(id: string) {
        const result = (await this.UserModel.deleteOne({ _id: id })).deletedCount === 1
        if (!result) throw new HttpException([{ message: "user not found", field: "id" }], HTTP_STATUSES.NOT_FOUND_404)
    }
    async updateOne(id: string, data: Partial<UserBd>) {
        const result = await this.UserModel.updateOne({ _id: id }, data)
        return result.modifiedCount === 1
    }
    // async readUserInfo(refreshToken: string) {
    //     const { userId } = this.jwtTokenService.getDataByRefreshToken(refreshToken)
    //     if (!userId) throw new HttpException([{ message: "refreshToken error", field: "refreshToken" }], HTTP_STATUSES.NOT_FOUND_404)
    //     const user: UserView | null = await this.UserModel.findById(userId).lean()
    //     if (!user) throw new HttpException([{ message: "userId not exist", field: "userId" }], HTTP_STATUSES.NOT_FOUND_404)
    //     const result: UserInfo = {
    //         email: user.email,
    //         login: user.login,
    //         userId: user.id
    //     }
    //     return result
    // }
}
