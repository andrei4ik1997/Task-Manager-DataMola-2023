import { SerializeOptions } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { AuthGuardLocal } from './guards/auth-guard.local';
import { AuthService } from './auth.service';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/entity/users.entity';
import { LoginRequest } from './auth.interfaces';
import { API_PATH } from 'src/app.constants';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags(API_PATH.auth)
@Controller(API_PATH.auth)
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(API_PATH.login)
  @UseGuards(AuthGuardLocal)
  @ApiBody({ type: LoginUserDto })
  async login(@CurrentUser() user: User): Promise<LoginRequest> {
    return {
      login: user.login,
      token: this.authService.getTokenForUser(user),
    };
  }
}
