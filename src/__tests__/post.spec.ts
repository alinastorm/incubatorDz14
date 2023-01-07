import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { PostsService } from '../posts/posts.service';
import { BlogInput, BlogView } from 'src/blogs/blog.model';
import { ExtendedLikesInfoView, PostInput, PostView } from 'src/posts/post.model';
import { LikeStatus } from '../comments/like.model';

describe('Cats', () => {
    let app: INestApplication;
    // let postsService = { findAll: () => ['test'] };
    let http
    // user
    const user = {
        "login": "string5",
        "password": "string",
        "email": "753464@gmail.com"
    }
    //blog
    const newBlog: BlogInput = {
        "name": "stringasda",
        "description": "stringadas",
        "websiteUrl": "https://someurl.com"
    }
    const BlogViewSchema: BlogView = {
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
    }
    let blogReceived: BlogView
    //post
    const newPost: PostInput = {
        "title": "string",
        "shortDescription": "string",
        "content": "string",
        "blogId": "string"
    }
    let postReceived: PostView
    const newExtendedLikesInfoViewSchema: ExtendedLikesInfoView = {
        likesCount: 0,
        dislikesCount: 0, //	integer($int32) 
        myStatus: LikeStatus.None, //string Enum: Array[3]    
        newestLikes: []
    }
    const PostViewSchema: PostView = {
        id: expect.any(String),
        title: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: newExtendedLikesInfoViewSchema
    }
    const updatePost: PostInput = {
        "title": "new string",
        "shortDescription": "new string",
        "content": "new string",
        "blogId": "string"
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
        // .expect({
        //     data: postsService.findAll(),
        // });
    });
    test(`1/GET posts`, () => {
        return request(http).get('/posts')
            .expect(200)
        // .expect({
        //     data: postsService.findAll(),
        // });
    });
    test('2/POST/blogs Создаем блог', async () => {
        const { status, body } = await request(http).post("/blogs")
            // .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newBlog)
        expect(status).toBe(201)
        expect(body).toMatchObject(BlogViewSchema)
        expect(body.name).toBe(newBlog.name)
        expect(body.description).toBe(newBlog.description)
        expect(body.websiteUrl).toBe(newBlog.websiteUrl)
        blogReceived = body
        newPost.blogId = body.id
        updatePost.blogId = body.id
    })
    test('3/GET/blogs Получаем блог', async () => {
        const { status, body } = await request(http).get("/blogs")
        expect(status).toBe(200)
        expect(body.items[0]).toStrictEqual(blogReceived)
        expect(body.items[0]).toMatchObject(BlogViewSchema)

    })
    test('4/POST/posts Публикуем пост', async () => {
        const { status, body } = await request(http).post("/posts")
            // .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(newPost)
        expect(status).toBe(201)
        expect(body).toMatchObject(PostViewSchema)
        expect(body.title).toBe(newPost.title)
        expect(body.shortDescription).toBe(newPost.shortDescription)
        expect(body.content).toBe(newPost.content)
        expect(body.blogId).toBe(newPost.blogId)
        postReceived = body

    })
    test('5/PUT/posts Обновляем пост', async () => {
        const { status, body } = await request(http).put(`/posts/${postReceived.id}`)
            // .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
            .send(updatePost)
        expect(status).toBe(204)
    })
    test('6/GET/posts Получаем пост', async () => {
        const { status, body } = await request(http).get(`/posts/${postReceived.id}`)
        // .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
        expect(status).toBe(200)
        expect(body).toMatchObject(PostViewSchema)
        expect(body.content).toBe(updatePost.content)
        expect(body.shortDescription).toBe(updatePost.shortDescription)
        expect(body.title).toBe(updatePost.title)
        expect(body.blogId).toBe(updatePost.blogId)
    })
    test('7/DELETE/posts Удаляем пост', async () => {
        const { status, body } = await request(http).delete(`/posts/${postReceived.id}`)
        // .set('Authorization', 'Basic YWRtaW46cXdlcnR5')     
        expect(status).toBe(204)

    })
    test('8/GET/posts Получаем пост', async () => {
        const { status, body } = await request(http).get(`/posts/${postReceived.id}`)
        // .set('Authorization', 'Basic YWRtaW46cXdlcnR5')  
        expect(status).toBe(404)
    })
    test('9/POST/users Создаем user', async () => {
        const { status, body } = await request(http).post(`/users`)
            .send(user)
        // .set('Authorization', 'Basic YWRtaW46cXdlcnR5')  
        expect(status).toBe(201)
    })
    test('10/GET/users Получаем users', async () => {
        const { status, body } = await request(http).get(`/users`)
        // .set('Authorization', 'Basic YWRtaW46cXdlcnR5')  
        expect(status).toBe(200)
    })

    //********************************************************************* */
    afterAll(async () => {
        await app.close();
    });
});



