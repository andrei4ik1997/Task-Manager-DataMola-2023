import {
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  SerializeOptions,
} from '@nestjs/common';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ForbiddenException, HttpCode } from '@nestjs/common';
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
import { NOT_EQUAL_PASSWORDS } from './users.constants';
import { NOT_AUTHORIZED_TO_CHANGE } from './users.constants';
import { USER_EXISTING, USER_NOT_FOUND } from './users.constants';
import { AuthorizedUser } from './decorators/authorized-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterRequest } from './users.interfaces';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags(API_PATH.users)
@Controller(API_PATH.users)
@SerializeOptions({ strategy: 'excludeAll' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Get(API_PATH.profile)
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  public async getProfile(
    @AuthorizedUser() authorizedUser: User,
  ): Promise<User> {
    return await authorizedUser;
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

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Patch(`:${API_PATH.userId}`)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  public async update(
    @Param(API_PATH.userId, ParseIntPipe) userId: number,
    @AuthorizedUser() authorizedUser: User,
    @Body() userDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    if (userId !== authorizedUser.id) {
      throw new ForbiddenException(null, NOT_AUTHORIZED_TO_CHANGE);
    }

    if (userDto.password !== userDto.retypedPassword) {
      throw new BadRequestException([NOT_EQUAL_PASSWORDS]);
    }
    return await this.usersService.updateUser(user, userDto);
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuardJwt)
  @Delete(`:${API_PATH.userId}`)
  delete(
    @Param(API_PATH.userId, ParseIntPipe) id: number,
    @AuthorizedUser() authorizedUser: User,
  ) {
    if (id !== authorizedUser.id) {
      throw new ForbiddenException(null, NOT_AUTHORIZED_TO_CHANGE);
    }
    return this.usersService.delete(id);
  }
}
