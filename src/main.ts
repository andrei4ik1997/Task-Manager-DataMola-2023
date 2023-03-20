import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { APP_LISTEN_PORT, PREFIX } from './app.constants';
import { AppModule } from './app.module';
import { swaggerCustomOptions } from './config/swager.config';
import { swaggerConfig, swaggerOptions } from './config/swager.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(PREFIX);
  app.use(json({ limit: '2mb' }));
  app.use(urlencoded({ extended: true, limit: '2mb' }));

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    swaggerOptions,
  );
  SwaggerModule.setup(PREFIX, app, document, swaggerCustomOptions);

  await app.listen(APP_LISTEN_PORT);
}
bootstrap();
