import { Expose } from 'class-transformer';
import { TABLE_NAME } from 'src/app.constants';
import { Column, Entity, JoinColumn } from 'typeorm';
import { ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from './tasks.entity';
import { User } from './users.entity';

@Entity(TABLE_NAME.comments)
export class Comment {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  createdDate: Date;

  @Column({ length: 280 })
  @Expose()
  text: string;

  @ManyToOne(() => Task, (task) => task.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  task: Task;

  @Column()
  taskId: number;

  @ManyToOne(() => User, (user) => user.comments)
  @Expose()
  creator: User;

  @Column()
  creatorId: number;
}
