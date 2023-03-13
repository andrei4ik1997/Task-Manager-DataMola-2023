import { Expose } from 'class-transformer';
import { TABLE_NAME } from 'src/app.constants';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Comment } from '../../comments/entity/comments.entity';
import { Task } from '../../tasks/entity/tasks.entity';

@Entity(TABLE_NAME.users)
export class User {
  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({ unique: true })
  @Expose()
  login: string;

  @Column({ unique: true })
  @Expose()
  userName: string;

  @Column()
  password: string;

  @OneToMany(() => Task, (task) => task.creator)
  @Expose()
  tasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.creator)
  @Expose()
  comments: Comment[];
}
