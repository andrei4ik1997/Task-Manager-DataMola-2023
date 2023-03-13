import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs('jwt.config', (): JwtModuleOptions => {
  return {
    secret: process.env.AUTH_SECRET,
    signOptions: {
      expiresIn: '60m',
    },
  };
});
