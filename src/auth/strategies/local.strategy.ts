import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { UsersService } from 'src/users/users.service';
import { User } from '../../users/entity/users.entity';
import { LOCAL_STRATEGY_FIELD, STRATEGY_NAME } from '../auth.constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_NAME.local,
) {
  constructor(private readonly usersService: UsersService) {
    super({
      usernameField: LOCAL_STRATEGY_FIELD.username,
      passwordField: LOCAL_STRATEGY_FIELD.password,
    });
  }

  public async validate(login: string, password: string): Promise<User> {
    const user = await this.usersService.findUserByLogin(login);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
