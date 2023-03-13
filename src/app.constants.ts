import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const APP_LISTEN_PORT = 3000;
export const PREFIX = 'api';

export const TABLE_NAME = {
  users: 'users',
  tasks: 'tasks',
  comments: 'comments',
};

export const API_PATH = {
  auth: 'auth',
  login: 'login',
  users: 'user',
  userId: 'userId',
  register: 'register',
  profile: 'my_profile',
  tasks: 'tasks',
  taskId: 'taskId',
  comments: 'comments',
};

export const APP_TITLE = 'Task Manager';
export const APP_DESCRIPTION = `The ${APP_TITLE} API`;
export const APP_VERSION = '1.0';

export const BEARER_AUTH_CONFIG: SecuritySchemeObject = {
  type: 'http',
  scheme: 'Bearer',
  bearerFormat: 'Token',
  name: 'JWT',
  description: 'Enter JWT token',
  in: 'header',
};
export const BEARER_AUTH_NAME = 'JWT-auth';
