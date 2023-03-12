import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';
import { User } from '../../entities/users.entity';
import { LOCAL_STRATEGY_FIELD, STRATEGY_NAME } from '../auth.constants';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_NAME.local,
) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      usernameField: LOCAL_STRATEGY_FIELD.username,
      passwordField: LOCAL_STRATEGY_FIELD.password,
    });
  }

  public async validate(login: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneBy({
      login,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
