import { SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { Get, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { API_PATH, BEARER_AUTH_NAME } from 'src/app.constants';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { User } from 'src/entities/users.entity';
import { AUTH_EXCEPTION } from './users.constants';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterRequest } from './users.interfaces';
import { UsersService } from './users.service';

@ApiTags(API_PATH.users)
@Controller(API_PATH.users)
@SerializeOptions({ strategy: 'excludeAll' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Get(API_PATH.profile)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  public async getProfile(@CurrentUser() user: User): Promise<User> {
    return await user;
  }

  @Post(API_PATH.register)
  public async create(
    @Body() userDto: CreateUserDto,
  ): Promise<RegisterRequest> {
    if (userDto.password !== userDto.retypedPassword) {
      throw new BadRequestException([AUTH_EXCEPTION.notEqualPasswords]);
    }

    const existingUser = await this.usersService.findUser(userDto);

    if (existingUser) {
      throw new BadRequestException([AUTH_EXCEPTION.existingUser]);
    }

    return await this.usersService.createUser(userDto);
  }
}
