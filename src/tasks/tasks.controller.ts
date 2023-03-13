import { Body, ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { Delete, ForbiddenException, Get } from '@nestjs/common';
import { Param, ParseIntPipe, Patch } from '@nestjs/common';
import { Post, SerializeOptions, UseGuards } from '@nestjs/common';
import { UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { HttpCode, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { API_PATH, BEARER_AUTH_NAME } from 'src/app.constants';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { User } from 'src/users/entity/users.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TASK_EXCEPTION } from './tasks.constants';
import { TasksService } from './tasks.service';

@ApiTags(API_PATH.tasks)
@Controller(API_PATH.tasks)
@SerializeOptions({ strategy: 'excludeAll' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll() {
    return await this.tasksService.getTasksWithCommentsCount();
  }

  @Get(`:${API_PATH.taskId}`)
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param(API_PATH.taskId, ParseIntPipe) taskId: number) {
    const task = await this.tasksService.getTaskWithComments(taskId);

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() taskDto: CreateTaskDto, @CurrentUser() user: User) {
    return await this.tasksService.createTask(taskDto, user);
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Patch(`:${API_PATH.taskId}`)
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param(API_PATH.taskId, ParseIntPipe) taskId: number,
    @Body() taskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    const task = await this.tasksService.findOne(taskId);

    if (!task) {
      throw new NotFoundException();
    }

    if (task.creatorId !== user.id) {
      throw new ForbiddenException(null, TASK_EXCEPTION.notAuthorizedToChange);
    }

    return await this.tasksService.updateTask(task, taskDto);
  }

  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Delete(`:${API_PATH.taskId}`)
  @UseGuards(AuthGuardJwt)
  @HttpCode(204)
  async remove(
    @Param(API_PATH.taskId, ParseIntPipe) taskId: number,
    @CurrentUser() user: User,
  ) {
    const task = await this.tasksService.findOne(taskId);

    if (!task) {
      throw new NotFoundException();
    }

    if (task.creatorId !== user.id) {
      throw new ForbiddenException(null, TASK_EXCEPTION.notAuthorizedToDelete);
    }

    await this.tasksService.deleteTask(taskId);
  }
}
