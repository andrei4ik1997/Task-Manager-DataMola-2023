import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { SALT } from './users.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT);
  }

  public async findUser(userDto: CreateUserDto): Promise<User> {
    return await this.usersRepository.findOne({
      where: [{ login: userDto.login }, { userName: userDto.userName }],
    });
  }

  public async findUserByLogin(login: string): Promise<User> {
    return await this.usersRepository.findOneBy({
      login,
    });
  }

  public async findUserById(id: number): Promise<User> {
    return await this.usersRepository.findOneBy({
      id,
    });
  }

  public async createUser(userDto: CreateUserDto): Promise<User> {
    const user = new User();

    user.login = userDto.login;
    user.userName = userDto.userName;
    user.password = await this.hashPassword(userDto.password);

    return await this.usersRepository.save(user);
  }
}
