import { Body, ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { Delete, ForbiddenException, Get } from '@nestjs/common';
import { Param, ParseIntPipe, Patch } from '@nestjs/common';
import { Post, SerializeOptions, UseGuards } from '@nestjs/common';
import { UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { HttpCode, NotFoundException } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthGuardJwt } from 'src/auth/guards/auth-guard.jwt';
import { User } from 'src/entities/users.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TASK_EXCEPTION } from './tasks.constants';
import { TasksService } from './tasks.service';

@Controller('/tasks')
@SerializeOptions({ strategy: 'excludeAll' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll() {
    return await this.tasksService.getTasksWithCommentsCount();
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const task = await this.tasksService.getTaskWithComments(id);

    if (!task) {
      throw new NotFoundException();
    }

    return task;
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() taskDto: CreateTaskDto, @CurrentUser() user: User) {
    return await this.tasksService.createTask(taskDto, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() taskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    const task = await this.tasksService.findOne(id);

    if (!task) {
      throw new NotFoundException();
    }

    if (task.creatorId !== user.id) {
      throw new ForbiddenException(null, TASK_EXCEPTION.notAuthorizedToChange);
    }

    return await this.tasksService.updateTask(task, taskDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  @HttpCode(204)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const task = await this.tasksService.findOne(id);

    if (!task) {
      throw new NotFoundException();
    }

    if (task.creatorId !== user.id) {
      throw new ForbiddenException(null, TASK_EXCEPTION.notAuthorizedToDelete);
    }

    await this.tasksService.deleteTask(id);
  }
}
