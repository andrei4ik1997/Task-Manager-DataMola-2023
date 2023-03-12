import { SwaggerDocumentOptions } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import { APP_VERSION } from 'src/app.constants';
import { BEARER_AUTH_CONFIG, BEARER_AUTH_NAME } from 'src/app.constants';
import { APP_DESCRIPTION, APP_TITLE } from 'src/app.constants';

export const swaggerConfig = new DocumentBuilder()
  .setTitle(APP_TITLE)
  .setDescription(APP_DESCRIPTION)
  .setVersion(APP_VERSION)
  .addBearerAuth(BEARER_AUTH_CONFIG, BEARER_AUTH_NAME)
  .build();

export const swaggerOptions: SwaggerDocumentOptions = {
  deepScanRoutes: true,
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
};

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customSiteTitle: APP_DESCRIPTION,
};
