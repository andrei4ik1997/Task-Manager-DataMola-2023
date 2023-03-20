import { ApiProperty } from '@nestjs/swagger';
import { IsBase64, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @Length(1)
  login: string;

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

  @ApiProperty({ minLength: 1 })
  @IsBase64()
  photo: string;
}
