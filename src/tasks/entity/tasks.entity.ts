import { Expose, Transform } from 'class-transformer';
import { TABLE_NAME } from 'src/app.constants';
import { Priority, Status } from 'src/tasks/tasks.enums';
import { ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Column, Entity } from 'typeorm';
import { Comment } from '../../comments/entity/comments.entity';
import { User } from '../../users/entity/users.entity';

@Entity(TABLE_NAME.tasks)
export class Task {
  constructor(partial?: Partial<Task>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  @Transform(({ value }) => value.toString())
  @Expose()
  id: number;

  @Column({ length: 100 })
  @Expose()
  name: string;

  @Column({ length: 280 })
  @Expose()
  description: string;

  @Column()
  @Expose()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  @Expose()
  assignee: User;

  @Column('enum', {
    enum: Status,
    default: Status.ToDo,
  })
  @Expose()
  status: Status;

  @Column('enum', {
    enum: Priority,
  })
  @Expose()
  priority: Priority;

  @Column({
    default: false,
  })
  @Expose()
  isPrivate: boolean;

  @ManyToOne(() => User, (user) => user.tasks)
  @Expose()
  creator: User;

  @Column()
  creatorId: number;

  @OneToMany(() => Comment, (comment) => comment.task, {
    cascade: true,
  })
  @Expose()
  comments: Comment[];

  @Expose()
  commentsCount?: number;
}
