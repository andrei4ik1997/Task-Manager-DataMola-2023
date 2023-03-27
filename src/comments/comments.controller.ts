import { NotFoundException, UseGuards, ValidationPipe } from '@nestjs/common';
import { HttpCode, HttpStatus, UsePipes } from '@nestjs/common';
import { Get, Param, ParseIntPipe } from '@nestjs/common';
import { Post, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { Body, ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { API_PATH, BEARER_AUTH_NAME } from 'src/app.constants';
import { AuthorizedUser } from 'src/users/decorators/authorized-user.decorator';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { User } from 'src/users/entity/users.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entity/comments.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { TASK_NOT_FOUND } from 'src/tasks/tasks.constants';

@ApiTags(API_PATH.comments)
@Controller(`${API_PATH.tasks}/:${API_PATH.taskId}/${API_PATH.comments}`)
@SerializeOptions({ strategy: 'excludeAll' })
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly tasksService: TasksService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  public async findAll(
    @Param(API_PATH.taskId, ParseIntPipe) taskId: number,
  ): Promise<Comment[]> {
    const task = await this.tasksService.findOne(taskId);

    if (!task) {
      throw new NotFoundException(TASK_NOT_FOUND);
    }

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
    @AuthorizedUser() authorizedUser: User,
  ): Promise<Comment[]> {
    const task = await this.tasksService.findOne(taskId);

    if (!task) {
      throw new NotFoundException(TASK_NOT_FOUND);
    }

    await this.commentsService.create(commentDto, taskId, authorizedUser.id);
    return await this.commentsService.getCommentsByTaskIdWithCreator(taskId);
  }
}
