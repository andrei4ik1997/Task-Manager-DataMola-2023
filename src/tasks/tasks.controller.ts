import { Controller, HttpStatus, Query } from '@nestjs/common';
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
import { STATUS_NOT_FOUND, TASK_NOT_FOUND } from './tasks.constants';
import { ASSIGNEE_NOT_FOUND } from './tasks.constants';
import { NOT_AUTHORIZED_TO_DELETE } from './tasks.constants';
import { NOT_AUTHORIZED_TO_CHANGE } from './tasks.constants';
import { TasksService } from './tasks.service';
import { Task } from './entity/tasks.entity';
import { UsersService } from 'src/users/users.service';
import { QueryParamsTaskDto } from './dto/query-params-task.dto';
import { CreateApiQueryDecorator } from '../helpers/createApiQueryDecorator.helper';
import { StatusParams } from './tasks.enums';

@ApiTags(API_PATH.tasks)
@Controller(API_PATH.tasks)
@SerializeOptions({ strategy: 'excludeAll' })
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @CreateApiQueryDecorator('queryParams', QueryParamsTaskDto)
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  public async findAll(
    @Query() queryParams: QueryParamsTaskDto,
  ): Promise<Task[]> {
    if (!Object.values(StatusParams).includes(queryParams.status)) {
      throw new NotFoundException(STATUS_NOT_FOUND);
    }

    if (queryParams.status === StatusParams.All) {
      return await this.tasksService.getAllTasksWithComments();
    }

    return await this.tasksService.getTasksWithCommentsByStatus(queryParams);
  }

  @Get(`:${API_PATH.taskId}`)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  public async findOne(
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
  public async create(
    @Body() taskDto: CreateTaskDto,
    @AuthorizedUser() authorizedUser: User,
  ): Promise<Task[]> {
    const assignee = await this.usersService.findUserById(
      Number(taskDto?.assignee || authorizedUser.id),
    );

    if (!assignee) {
      throw new NotFoundException(ASSIGNEE_NOT_FOUND);
    }

    await this.tasksService.createTask(taskDto, authorizedUser, assignee);
    return await this.tasksService.getAllTasksWithComments();
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Patch(`:${API_PATH.taskId}`)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  public async update(
    @Param(API_PATH.taskId, ParseIntPipe) taskId: number,
    @Body() taskDto: UpdateTaskDto,
    @AuthorizedUser() authorizedUser: User,
  ): Promise<Task[]> {
    const task = await this.tasksService.findOneWithAssignee(taskId);

    if (!task) {
      throw new NotFoundException(TASK_NOT_FOUND);
    }

    if (task.creatorId !== authorizedUser.id) {
      throw new ForbiddenException(null, NOT_AUTHORIZED_TO_CHANGE);
    }

    const assignee = await this.usersService.findUserById(
      Number(taskDto.assignee || task.assignee.id),
    );

    if (!assignee) {
      throw new NotFoundException(ASSIGNEE_NOT_FOUND);
    }

    await this.tasksService.updateTask(task, taskDto, assignee);
    return await this.tasksService.getAllTasksWithComments();
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Delete(`:${API_PATH.taskId}`)
  @UseGuards(AuthGuardJwt)
  public async remove(
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
    return await this.tasksService.getAllTasksWithComments();
  }
}
