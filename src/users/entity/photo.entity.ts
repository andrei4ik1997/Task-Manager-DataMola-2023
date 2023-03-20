import { Expose, Transform } from 'class-transformer';
import { TABLE_NAME } from 'src/app.constants';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity(TABLE_NAME.photo)
export class Photo {
  constructor(partial?: Partial<Photo>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  @Transform(({ value }) => value.toString())
  @Expose()
  id: string;

  @Column()
  @Expose()
  photo: string;
}
