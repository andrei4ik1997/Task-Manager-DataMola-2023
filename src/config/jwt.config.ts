import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { JWT_EXPIRES_IN } from 'src/app.constants';

export default registerAs('jwt.config', (): JwtModuleOptions => {
  return {
    secret: process.env.AUTH_SECRET,
    signOptions: {
      expiresIn: JWT_EXPIRES_IN,
    },
  };
});
