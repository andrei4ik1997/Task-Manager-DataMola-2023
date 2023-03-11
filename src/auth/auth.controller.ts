import { BadRequestException, Body, SerializeOptions } from '@nestjs/common';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { Get, Post } from '@nestjs/common';
import { AuthGuardJwt } from './guards/auth-guard.jwt';
import { AuthGuardLocal } from './guards/auth-guard.local';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginRequest, RegisterRequest } from './auth.interfaces';
import { AUTH_EXCEPTION } from './auth.constants';

@Controller('auth')
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @UseGuards(AuthGuardLocal)
  async login(@CurrentUser() user: User): Promise<LoginRequest> {
    return {
      userId: user.id,
      token: this.authService.getTokenForUser(user),
    };
  }

  @Post('register')
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

  @Get('profile')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
