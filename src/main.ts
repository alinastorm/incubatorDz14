import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import validationPipe from './_commons/pipes/mapValidationErrors.pipe';
import * as fs from "fs"
import * as cookieParser from 'cookie-parser';
import { ExceptionMapperFilter } from './_commons/filters/exception.filter';


async function bootstrap() {

  //https . SSL Certificate
  const httpsOptions = {
    key: fs.readFileSync('./ssl/ubt.by-key.pem', 'utf-8'),
    cert: fs.readFileSync('./ssl/ubt.by-crt.pem', 'utf-8'),
    ca: fs.readFileSync('./ssl/ubt.by-chain-only.pem', 'utf8')
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  //отключаем CORS
  app.enableCors();

  // cookieParser
  app.use(cookieParser());

  //Global pipe
  app.useGlobalPipes(validationPipe)

  //Exception Mapper Filter
  app.useGlobalFilters(new ExceptionMapperFilter());

  //swager http://localhost:9002/api
  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Median API description')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);


  //start
  await app.listen(9002);
}

bootstrap();