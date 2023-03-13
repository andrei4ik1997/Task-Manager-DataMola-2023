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

  private getTasksWithCommentsCountQuery(): SelectQueryBuilder<Task> {
    return this.getTasksBaseQuery().loadRelationCountAndMap(
      'task.commentsCount',
      'task.comments',
    );
  }

  private getTaskWithCommentsQuery(id: number): SelectQueryBuilder<Task> {
    return this.getTasksBaseQuery()
      .leftJoinAndSelect('task.comments', 't')
      .leftJoinAndSelect('t.creator', 'с')
      .where({ id });
  }

  public async getTasksWithCommentsCount(): Promise<Task[]> {
    const query = this.getTasksWithCommentsCountQuery();

    return await query.getMany();
  }

  public async getTaskWithComments(id: number): Promise<Task | undefined> {
    const query = this.getTaskWithCommentsQuery(id);

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
