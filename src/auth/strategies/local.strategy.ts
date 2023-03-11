import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';
import { AuthNamespace } from '../auth.namespace';
import { User } from '../../entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  AuthNamespace.StrategyName.local,
) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      usernameField: AuthNamespace.LocalStrategyFields.username,
      passwordField: AuthNamespace.LocalStrategyFields.password,
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
