import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Users } from '../entities/users.entity';
import { SALT } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public getTokenForUser(user: Users): string {
    return this.jwtService.sign({
      login: user.login,
      userName: user.userName,
      userId: user.id,
    });
  }

  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT);
  }
}
