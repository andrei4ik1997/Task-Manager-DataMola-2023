import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/tasks/entity/tasks.entity';
import { User } from 'src/users/entity/users.entity';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  private getTasksBaseQuery(): SelectQueryBuilder<Task> {
    return this.tasksRepository
      .createQueryBuilder('task')
      .orderBy('task.id', 'DESC');
  }

  private getTasksWithCommentsQuery(): SelectQueryBuilder<Task> {
    return this.getTasksBaseQuery().leftJoinAndSelect('task.comments', 't');
  }

  private getTaskWithCommentsAndCommentCreatorQuery(
    id: number,
  ): SelectQueryBuilder<Task> {
    return this.getTasksWithCommentsQuery()
      .leftJoinAndSelect('t.creator', 'c')
      .where({ id });
  }

  public async getTasksWithComments(): Promise<Task[]> {
    const query = this.getTasksWithCommentsQuery();

    return await query.getMany();
  }

  public async getTaskWithCommentsAndCommentCreator(
    id: number,
  ): Promise<Task | undefined> {
    const query = this.getTaskWithCommentsAndCommentCreatorQuery(id);

    return await query.getOne();
  }

  public async findOne(id: number): Promise<Task | undefined> {
    return await this.tasksRepository.findOneBy({ id });
  }

  public async createTask(taskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = new Task({
      ...taskDto,
      creatorId: user.id,
      assignee: user.userName,
      createdAt: new Date(),
    });

    return await this.tasksRepository.save(task);
  }

  public async updateTask(task: Task, taskDto: UpdateTaskDto): Promise<Task> {
    return await this.tasksRepository.save(
      new Task({
        ...task,
        ...taskDto,
        assignee: taskDto.assignee ? taskDto.assignee : task.assignee,
        createdAt: new Date(),
      }),
    );
  }

  public async deleteTask(id: number): Promise<DeleteResult> {
    return await this.tasksRepository
      .createQueryBuilder('task')
      .delete()
      .where('id = :id', { id })
      .execute();
  }
}
