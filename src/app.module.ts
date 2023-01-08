import { ConfigModule } from '@nestjs/config'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './authentication/users/users.controller';
import { PostsController } from './posts/posts.controller';
import { CommentsController } from './comments/comments.controller';
import { BlogsController } from './blogs/blogs.controller';
import { TestingController } from './testing/testing.controller';
import { UsersService } from './authentication/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './authentication/users/user.model';
// import { UserSchemaClass } from './user/user.model';
import { BlogsService } from './blogs/blogs.service';
import { PostsService } from './posts/posts.service';
import { CryptoService } from './_commons/services/crypto-service';
import { Blog, BlogSchema } from './blogs/blog.model';
import { Post, PostSchema } from './posts/post.model';
import { CommentsService } from './comments/comments.service';
import { CommentSchema, Comment } from './comments/comment.model';
import { CommentIdValidatorPipe } from './_commons/pipes/commentId.validation.pipe';
import { Auth, AuthSchema } from './authentication/auths/auth.model';
import { AppLoggerMiddleware } from './_commons/helpers/logger';
import { JwtModule } from '@nestjs/jwt'
import { JwtTokenService } from './_commons/services/jwtToken-service';
import { DeviceSession, deviceSessionSchema } from './authentication/devicesSessions/deviceSession.model';
import { DeviceSessionsService } from './authentication/devicesSessions/deviceSessions.service';
import { RecoveryPasswordsService } from './authentication/recoveryPasswords/recoweryPasswords.service';
import { RecoweryPassword, passwordRecowerySchema } from './authentication/recoveryPasswords/recoveryPassword.model';
import { EmailService } from './_commons/services/email-service';
import { RegistrationCode, registrationCodeSchema } from './authentication/registrationCodes/registrationCode.model';
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
    MongooseModule.forFeature([{ name: DeviceSession.name, schema: deviceSessionSchema }]),
    MongooseModule.forFeature([{ name: RecoweryPassword.name, schema: passwordRecowerySchema }]),
    MongooseModule.forFeature([{ name: RegistrationCode.name, schema: registrationCodeSchema }]),
  ],
  // imports: [MongooseModule, UserModule],
  controllers: [AppController, UserController, PostsController, CommentsController, BlogsController, TestingController, CommentsController],
  providers: [
    CommentIdValidatorPipe,
    AppService, CryptoService, UsersService, BlogsService, PostsService, CommentsService, JwtTokenService, DeviceSessionsService, RecoveryPasswordsService,EmailService
    // { provide: 'CommentIdValidatorPipe', useClass: CommentIdValidatorPipe }
  ],
  // providers: [AppService, UserService,UserSchemaClass],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
