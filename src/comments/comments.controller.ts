import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Get, Param, ParseIntPipe } from '@nestjs/common';
import { Post, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { Body, ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { API_PATH } from 'src/app.constants';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { User } from 'src/entities/users.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller(`${API_PATH.tasks}/:${API_PATH.taskId}/${API_PATH.comments}`)
@SerializeOptions({ strategy: 'excludeAll' })
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Param(API_PATH.taskId, ParseIntPipe) taskId: number) {
    return await this.commentsService.getCommentsByTaskIdWithCreator(taskId);
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Param(API_PATH.taskId, ParseIntPipe) taskId: number,
    @Body() commentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.create(commentDto, taskId, user.id);
  }
}
