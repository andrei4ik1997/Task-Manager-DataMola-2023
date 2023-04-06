import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/tasks/entity/tasks.entity';
import { User } from 'src/users/entity/users.entity';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryParamsTaskDto } from './dto/query-params-task.dto';
import { DEFAULT_SKIP, DEFAULT_TOP } from './tasks.constants';

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

  private getTasksWithAssignerQuery(): SelectQueryBuilder<Task> {
    return this.getTasksBaseQuery().leftJoinAndSelect(
      'task.assignee',
      'assigner',
    );
  }

  private getTasksWithCommentsQuery(): SelectQueryBuilder<Task> {
    return this.getTasksBaseQuery()
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('creator.photo', 'creatorPhoto')
      .leftJoinAndSelect('task.assignee', 'assigner')
      .leftJoinAndSelect('assigner.photo', 'assignerPhoto')
      .leftJoinAndSelect('task.comments', 'comments');
  }

  private getTaskWithCommentsAndCommentCreatorQuery(
    id: number,
  ): SelectQueryBuilder<Task> {
    return this.getTasksWithCommentsQuery()
      .leftJoinAndSelect('comments.creator', 'commentCreator')
      .leftJoinAndSelect('commentCreator.photo', 'commentCreatorPhoto')
      .where({ id });
  }

  public async getTasksWithComments(
    queryParams?: QueryParamsTaskDto,
  ): Promise<Task[]> {
    const query = this.getTasksWithCommentsQuery()
      .offset(queryParams?.skip || DEFAULT_SKIP)
      .limit(queryParams?.top || DEFAULT_TOP);

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

  public async findOneWithAssignee(id: number): Promise<Task | undefined> {
    const query = this.getTasksWithAssignerQuery().where({ id });
    return await query.getOne();
  }

  public async createTask(
    taskDto: CreateTaskDto,
    user: User,
    assignee: User,
  ): Promise<Task> {
    const task = new Task({
      ...taskDto,
      creatorId: user.id,
      assignee: assignee,
      createdAt: new Date(),
    });
    return await this.tasksRepository.save(task);
  }

  public async updateTask(
    task: Task,
    taskDto: UpdateTaskDto,
    assignee: User,
  ): Promise<Task> {
    const updatedTask = new Task({
      ...task,
      ...taskDto,
      assignee,
      createdAt: new Date(),
    });

    return await this.tasksRepository.save(updatedTask);
  }

  public async deleteTask(id: number): Promise<DeleteResult> {
    return await this.getTasksBaseQuery().delete().where({ id }).execute();
  }
}
