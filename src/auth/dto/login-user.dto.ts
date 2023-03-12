import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @Length(1)
  login: string;

  @ApiProperty({ minLength: 1 })
  @IsString()
  @Length(1)
  password: string;
}
