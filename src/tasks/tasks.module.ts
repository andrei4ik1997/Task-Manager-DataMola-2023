import { UsersService } from './../users/users.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/tasks/entity/tasks.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { User } from 'src/users/entity/users.entity';
import { Photo } from 'src/users/entity/photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Photo])],
  controllers: [TasksController],
  providers: [TasksService, UsersService],
  exports: [TasksService],
})
export class TasksModule {}
