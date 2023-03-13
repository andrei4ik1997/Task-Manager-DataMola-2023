import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/users.entity';
import { SALT } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public getTokenForUser(user: User): string {
    return this.jwtService.sign({
      login: user.login,
      userName: user.userName,
      userId: user.id,
    });
  }


  }
}
