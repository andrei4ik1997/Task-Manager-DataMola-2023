import { TasksService } from './../tasks/tasks.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entity/comments.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Task } from 'src/tasks/entity/tasks.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Comment])],
  controllers: [CommentsController],
  providers: [CommentsService, TasksService],
})
export class CommentsModule {}
