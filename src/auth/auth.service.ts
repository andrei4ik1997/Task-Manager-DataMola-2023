import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/users.entity';

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
