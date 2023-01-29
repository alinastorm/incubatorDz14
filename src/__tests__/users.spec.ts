import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { PostsService } from '../posts/posts.service';
import { LikeStatus } from '../comments/like.model';
import { MeView, UserInput, UserInputDto } from '../authentication/users/user.model';
import { Login } from '../authentication/authentication.types';
import { Paginator } from 'src/_commons/types/types';

describe('POSTS', () => {
    let app: INestApplication;
    // let postsService = { findAll: () => ['test'] };
    let http
    // user
    const user: UserInputDto = {
        "login": "sasa",
        "password": "qwerty",
        "email": "7534640@gmail.com"
    }
    const auth: Login = {
        loginOrEmail: "sasa",
        password: "qwerty"
    }
    const paginationSchema: Paginator<any> = {
        page: expect.any(Number),
        pagesCount: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number),
        items: expect.any(Array),
    }
    let accessTokenRecived: string
    let refreshTokenRecived: string
    const meSchema: MeView = {
        email: expect.any(String),
        login: expect.any(String),
        userId: expect.any(String),
    }


    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        // .overrideProvider(PostsService)
        // .useValue(postsService)

        app = moduleRef.createNestApplication();
        http = app.getHttpServer()
        await app.init();
    });
    //********************************************************************* */

    test(`0/DELETE/testing/all-data`, () => {
        return request(http).delete('/testing/all-data')
            .expect(204)
    });

    // test(`1/POST user`, () => {
    //     return request(http)
    //         .post('/users')
    //         .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
    //         .send(user)
    //         .expect(201)

    // });


    //**** */
    test(`GET users =[null]`, async () => {
        const { status, body } = await request(http)
            .get(`/users`)
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')

        expect(status).toBe(200)

        expect(body).toStrictEqual({
            "pagesCount": 0,
            "page": 1,
            "pageSize": 10,
            "totalCount": 0,
            "items": []
        })

    })
    test(`Create User without admin rights`, async () => {
        const { status } = await request(http).post("/users")
            .send(user)

        expect(status).toBe(401)
    })
    test(`Create User`, async () => {
        const { status } = await request(http).post("/users")
            .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(user)

        expect(status).toBe(201)
    })
    test(`Auth login`, async () => {
        const { status, body, headers } = await request(http).post("/auth/login")
            .send(auth)

        accessTokenRecived = body.accessToken
        expect(body).toStrictEqual({
            "accessToken": expect.any(String)
        })
        expect(accessTokenRecived).toStrictEqual(expect.any(String))
        //check refresh token
        const jwt = headers['set-cookie'][0].split(";")[0].split("=")
        const tokenName = jwt[0]
        refreshTokenRecived = jwt[1]
        expect(tokenName).toBe("refreshToken")
        expect(refreshTokenRecived).toStrictEqual(expect.any(String))
    })
    test(`Auth send access token in cookies`, async () => {
        const res = await request(http)
            .get("/auth/me")
            .auth(accessTokenRecived, { type: 'bearer' })
            // .auth(accessTokenRecived, { type: 'bearer' })
        expect(res.body).toMatchObject(meSchema)

    })


    //********************************************************************* */
    afterAll(async () => {
        await app.close();
    });
});



