import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Get, Param, ParseIntPipe } from '@nestjs/common';
import { Post, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { Body, ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { API_PATH, BEARER_AUTH_NAME } from 'src/app.constants';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { User } from 'src/entities/users.entity';
import { UsersService } from './users.service';

@ApiTags(API_PATH.users)
@Controller(API_PATH.users)
@SerializeOptions({ strategy: 'excludeAll' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
