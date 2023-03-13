import { HttpCode, HttpStatus, SerializeOptions } from '@nestjs/common';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Get, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { API_PATH, BEARER_AUTH_NAME } from 'src/app.constants';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { User } from 'src/users/entity/users.entity';
import { NOT_EQUAL_PASSWORDS, USER_EXISTING } from './users.constants';
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
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  public async getProfile(@CurrentUser() user: User): Promise<User> {
    return await user;
  }

  @Post(API_PATH.register)
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() userDto: CreateUserDto,
  ): Promise<RegisterRequest> {
    if (userDto.password !== userDto.retypedPassword) {
      throw new BadRequestException([NOT_EQUAL_PASSWORDS]);
    }

    const existingUser = await this.usersService.findUser(userDto);

    if (existingUser) {
      throw new BadRequestException([USER_EXISTING]);
    }

    return await this.usersService.createUser(userDto);
  }
}
