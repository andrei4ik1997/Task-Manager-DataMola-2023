import { Controller, HttpStatus } from '@nestjs/common';
import { Body, ClassSerializerInterceptor } from '@nestjs/common';
import { Delete, ForbiddenException, Get } from '@nestjs/common';
import { Param, ParseIntPipe, Patch } from '@nestjs/common';
import { Post, SerializeOptions, UseGuards } from '@nestjs/common';
import { UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { HttpCode, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { API_PATH, BEARER_AUTH_NAME } from 'src/app.constants';
import { AuthorizedUser } from 'src/users/decorators/authorized-user.decorator';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { User } from 'src/users/entity/users.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NOT_AUTHORIZED_TO_DELETE, TASK_NOT_FOUND } from './tasks.constants';
import { NOT_AUTHORIZED_TO_CHANGE } from './tasks.constants';
import { TasksService } from './tasks.service';
import { Task } from './entity/tasks.entity';

@ApiTags(API_PATH.tasks)
@Controller(API_PATH.tasks)
@SerializeOptions({ strategy: 'excludeAll' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(): Promise<Task[]> {
    return await this.tasksService.getTasksWithComments();
  }

  @Get(`:${API_PATH.taskId}`)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(
    @Param(API_PATH.taskId, ParseIntPipe) taskId: number,
  ): Promise<Task> {
    const task = await this.tasksService.getTaskWithCommentsAndCommentCreator(
      taskId,
    );

    if (!task) {
      throw new NotFoundException(TASK_NOT_FOUND);
    }

    return task;
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() taskDto: CreateTaskDto,
    @AuthorizedUser() authorizedUser: User,
  ): Promise<Task[]> {
    await this.tasksService.createTask(taskDto, authorizedUser);
    return await this.tasksService.getTasksWithComments();
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Patch(`:${API_PATH.taskId}`)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param(API_PATH.taskId, ParseIntPipe) taskId: number,
    @Body() taskDto: UpdateTaskDto,
    @AuthorizedUser() authorizedUser: User,
  ): Promise<Task[]> {
    const task = await this.tasksService.findOne(taskId);

    if (!task) {
      throw new NotFoundException(TASK_NOT_FOUND);
    }

    if (task.creatorId !== authorizedUser.id) {
      throw new ForbiddenException(null, NOT_AUTHORIZED_TO_CHANGE);
    }
    await this.tasksService.updateTask(task, taskDto);
    return await this.tasksService.getTasksWithComments();
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Delete(`:${API_PATH.taskId}`)
  @UseGuards(AuthGuardJwt)
  async remove(
    @Param(API_PATH.taskId, ParseIntPipe) taskId: number,
    @AuthorizedUser() authorizedUser: User,
  ): Promise<Task[]> {
    const task = await this.tasksService.findOne(taskId);

    if (!task) {
      throw new NotFoundException(TASK_NOT_FOUND);
    }

    if (task.creatorId !== authorizedUser.id) {
      throw new ForbiddenException(null, NOT_AUTHORIZED_TO_DELETE);
    }

    await this.tasksService.deleteTask(taskId);
    return await this.tasksService.getTasksWithComments();
  }
}
