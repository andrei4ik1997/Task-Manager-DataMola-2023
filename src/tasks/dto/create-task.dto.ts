import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Priority, Status } from '../tasks.enums';

export class CreateTaskDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @Length(1)
  name: string;

  @ApiProperty({ minLength: 1, maxLength: 280 })
  @Length(1, 280)
  description: string;

  @ApiProperty({ minLength: 1, required: false })
  @IsOptional()
  @Length(1)
  assignee?: number;

  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  status: Status;

  @ApiProperty({ enum: Priority })
  @IsEnum(Priority)
  priority: Priority;

  @ApiProperty({ type: 'boolean' })
  @IsBoolean()
  isPrivate: boolean;
}
