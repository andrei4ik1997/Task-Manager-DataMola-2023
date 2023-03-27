import { SerializeOptions, UseInterceptors } from '@nestjs/common';
import { ClassSerializerInterceptor, Patch } from '@nestjs/common';
import { Delete, Param, ParseIntPipe } from '@nestjs/common';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ForbiddenException, HttpCode } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { Get, Post } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { API_PATH, BEARER_AUTH_NAME } from 'src/app.constants';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { User } from 'src/users/entity/users.entity';
import { NOT_EQUAL_PASSWORDS, USER_NAME_TAKEN } from './users.constants';
import { NOT_AUTHORIZED_TO_CHANGE } from './users.constants';
import { USER_EXISTING, USER_NOT_FOUND } from './users.constants';
import { AuthorizedUser } from './decorators/authorized-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags(API_PATH.users)
@Controller(API_PATH.users)
@SerializeOptions({ strategy: 'excludeAll' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(API_PATH.allUsers)
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  public async getAll(): Promise<User[]> {
    return await this.usersService.getUsersWithPhoto();
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Get(API_PATH.profile)
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  public async getProfile(
    @AuthorizedUser() authorizedUser: User,
  ): Promise<User> {
    const user = await this.usersService.getUserWithPhoto(authorizedUser.id);
    return user;
  }

  @Post(API_PATH.register)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(ClassSerializerInterceptor)
  public async create(@Body() userDto: CreateUserDto): Promise<User> {
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

    const userByUserName = await this.usersService.findUserByUserName(
      userDto.userName,
    );

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    if (userByUserName) {
      throw new ForbiddenException(null, USER_NAME_TAKEN);
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
  @UseInterceptors(ClassSerializerInterceptor)
  public async delete(
    @Param(API_PATH.userId, ParseIntPipe) userId: number,
    @AuthorizedUser() authorizedUser: User,
  ): Promise<User[]> {
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    if (userId !== authorizedUser.id) {
      throw new ForbiddenException(null, NOT_AUTHORIZED_TO_CHANGE);
    }

    await this.usersService.delete(userId);

    return await this.usersService.getUsersWithPhoto();
  }
}
