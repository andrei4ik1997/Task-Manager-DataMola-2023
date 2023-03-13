import { BadRequestException, Body, SerializeOptions } from '@nestjs/common';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { Get, Post } from '@nestjs/common';
import { AuthGuardJwt } from './guards/auth-guard.jwt';
import { AuthGuardLocal } from './guards/auth-guard.local';
import { AuthService } from './auth.service';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../entities/users.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginRequest, RegisterRequest } from './auth.interfaces';
import { AUTH_EXCEPTION } from './auth.constants';
import { API_PATH, BEARER_AUTH_NAME } from 'src/app.constants';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags(API_PATH.auth)
@Controller(API_PATH.auth)
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  @Post(API_PATH.login)
  @UseGuards(AuthGuardLocal)
  @ApiBody({ type: LoginUserDto })
  async login(@CurrentUser() user: User): Promise<LoginRequest> {
    return {
      userId: user.id,
      token: this.authService.getTokenForUser(user),
    };
  }

  @Post(API_PATH.register)
  async create(@Body() createUserDto: CreateUserDto): Promise<RegisterRequest> {
    const user = new User();

    if (createUserDto.password !== createUserDto.retypedPassword) {
      throw new BadRequestException([AUTH_EXCEPTION.notEqualPasswords]);
    }

    const existingUser = await this.userRepository.findOne({
      where: [
        { login: createUserDto.login },
        { userName: createUserDto.userName },
      ],
    });

    if (existingUser) {
      throw new BadRequestException([AUTH_EXCEPTION.existingUser]);
    }

    user.login = createUserDto.login;
    user.userName = createUserDto.userName;
    user.password = await this.authService.hashPassword(createUserDto.password);

    return {
      ...(await this.userRepository.save(user)),
      token: this.authService.getTokenForUser(user),
    };
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Get(API_PATH.profile)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
