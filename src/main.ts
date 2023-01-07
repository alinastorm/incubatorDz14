import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import validationPipe from './_commons/pipes/mapValidationErrors.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //отключаем CORS
  app.enableCors();
  //Global pipe
  app.useGlobalPipes(validationPipe)
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