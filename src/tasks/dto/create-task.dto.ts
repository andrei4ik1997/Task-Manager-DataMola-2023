import { IsString, Length } from 'class-validator';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Priority, Status } from '../tasks.enums';

export class CreateTaskDto {
  @IsString()
  @Length(1)
  name: string;

  @Length(1, 280)
  description: string;

  @IsString()
  @IsOptional()
  @Length(1)
  assignee?: string;

  @IsEnum(Status)
  status: Status;

  @IsEnum(Priority)
  priority: Priority;

  @IsBoolean()
  isPrivate: boolean;
}
