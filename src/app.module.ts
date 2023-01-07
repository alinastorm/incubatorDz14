import { ConfigModule } from '@nestjs/config'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './users/users.controller';
import { PostsController } from './posts/posts.controller';
import { CommentsController } from './comments/comments.controller';
import { BlogsController } from './blogs/blogs.controller';
import { TestingController } from './testing/testing.controller';
import { UserService } from './users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/user.model';
// import { UserSchemaClass } from './user/user.model';
import { BlogsService } from './blogs/blogs.service';
import { PostsService } from './posts/posts.service';
import { CryptoService } from './_commons/services/crypto-service';
import { Blog, BlogSchema } from './blogs/blog.model';
import { Post, PostSchema } from './posts/post.model';
import { CommentsService } from './comments/comments.service';
import { CommentSchema, Comment } from './comments/comment.model';
import { CommentIdValidatorPipe } from './_commons/pipes/commentId.validation.pipe';
import { Auth, AuthSchema } from './auth/authentications/auth.model';
import { AppLoggerMiddleware } from './_commons/helpers/logger';
import { JwtModule } from '@nestjs/jwt'
// import './_commons/utils/mongoose.utils';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({}),
    MongooseModule.forRoot(process.env.MONGO_URL_ATLAS, { dbName: process.env.MONGO_DB_NAME }),
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  // imports: [MongooseModule, UserModule],
  controllers: [AppController, UserController, PostsController, CommentsController, BlogsController, TestingController, CommentsController],
  providers: [
    CommentIdValidatorPipe,
    AppService, CryptoService, UserService, BlogsService, PostsService, CommentsService,
    // { provide: 'CommentIdValidatorPipe', useClass: CommentIdValidatorPipe }
  ],
  // providers: [AppService, UserService,UserSchemaClass],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
