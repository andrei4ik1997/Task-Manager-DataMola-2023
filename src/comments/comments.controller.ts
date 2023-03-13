import {
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Get, Param, ParseIntPipe } from '@nestjs/common';
import { Post, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { Body, ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { API_PATH, BEARER_AUTH_NAME } from 'src/app.constants';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { User } from 'src/users/entity/users.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entity/comments.entity';

@ApiTags(API_PATH.comments)
@Controller(`${API_PATH.tasks}/:${API_PATH.taskId}/${API_PATH.comments}`)
@SerializeOptions({ strategy: 'excludeAll' })
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  public async findAll(
    @Param(API_PATH.taskId, ParseIntPipe) taskId: number,
  ): Promise<Comment[]> {
    return await this.commentsService.getCommentsByTaskIdWithCreator(taskId);
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  public async create(
    @Param(API_PATH.taskId, ParseIntPipe) taskId: number,
    @Body() commentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    return this.commentsService.create(commentDto, taskId, user.id);
  }
}
