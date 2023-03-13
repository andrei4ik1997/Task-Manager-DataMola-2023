import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  @Length(1, 100)
  userName: string;

  @ApiProperty({ minLength: 1 })
  @IsString()
  @Length(1)
  password: string;

  @ApiProperty({ minLength: 1 })
  @IsString()
  @Length(1)
  retypedPassword: string;
}
