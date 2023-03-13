import { HttpCode, HttpStatus, SerializeOptions } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { AuthGuardLocal } from './guards/auth-guard.local';
import { AuthService } from './auth.service';
import { AuthorizedUser } from '../users/decorators/authorized-user.decorator';
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuardLocal)
  @ApiBody({ type: LoginUserDto })
  public async login(
    @AuthorizedUser() authorizedUser: User,
  ): Promise<LoginRequest> {
    return {
      login: authorizedUser.login,
      token: this.authService.getTokenForUser(authorizedUser),
    };
  }
}
