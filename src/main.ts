import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { APP_LISTEN_PORT, PREFIX } from './app.constants';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(PREFIX);
  await app.listen(APP_LISTEN_PORT);
}
bootstrap();
