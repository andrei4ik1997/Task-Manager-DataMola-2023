import { IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1)
  login: string;

  @IsString()
  @Length(1, 100)
  userName: string;

  @IsString()
  @Length(1)
  password: string;

  @IsString()
  @Length(1)
  retypedPassword: string;
}
