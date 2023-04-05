import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/entity/comments.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  private getCommentsBaseQuery(): SelectQueryBuilder<Comment> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .orderBy('comment.id', 'DESC');
  }

  private getCommentsWithCreatorQuery(): SelectQueryBuilder<Comment> {
    return this.getCommentsBaseQuery()
      .leftJoinAndSelect('comment.creator', 'commentCreator')
      .leftJoinAndSelect('commentCreator.photo', 'commentCreatorPhoto');
  }

  public async getCommentsByTaskIdWithCreator(
    taskId: number,
  ): Promise<Comment[]> {
    const query = this.getCommentsWithCreatorQuery().where({ taskId });

    return await query.getMany();
  }

  public async create(
    commentDto: CreateCommentDto,
    taskId: number,
    userId: number,
  ): Promise<Comment> {
    const comment = new Comment({
      ...commentDto,
      creatorId: userId,
      taskId: taskId,
      createdAt: new Date(),
    });

    return await this.commentsRepository.save(comment);
  }
}
