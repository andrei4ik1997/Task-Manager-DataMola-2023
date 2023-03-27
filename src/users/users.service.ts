import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/users.entity';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { SALT } from './users.constants';
import { UpdateUserDto } from './dto/update-user.dto';
import { Photo } from './entity/photo.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT);
  }

  private getUsersBaseQuery(): SelectQueryBuilder<User> {
    return this.usersRepository
      .createQueryBuilder('user')
      .orderBy('user.id', 'DESC');
  }

  private getUsersWithPhotoQuery(): SelectQueryBuilder<User> {
    return this.getUsersBaseQuery().leftJoinAndSelect(
      'user.photo',
      'userPhoto',
    );
  }

  private getUserWithPhotoQuery(id: number): SelectQueryBuilder<User> {
    return this.getUsersWithPhotoQuery().where({ id });
  }

  public async getUsersWithPhoto(): Promise<User[]> {
    const query = this.getUsersWithPhotoQuery();

    return await query.getMany();
  }

  public async getUserWithPhoto(id: number): Promise<User | undefined> {
    const query = this.getUserWithPhotoQuery(id);

    return await query.getOne();
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

  public async findUserByUserName(userName: string): Promise<User> {
    return await this.usersRepository.findOneBy({
      userName,
    });
  }

  public async findUserById(id: number): Promise<User> {
    return await this.usersRepository.findOneBy({
      id,
    });
  }

  public async createUser(userDto: CreateUserDto): Promise<User> {
    const newPhoto = new Photo({ photo: userDto.photo });

    await this.photoRepository.save(newPhoto);

    const user = new User({
      login: userDto.login,
      userName: userDto.userName,
      photo: newPhoto,
      password: await this.hashPassword(userDto.password),
    });

    await this.usersRepository.save(user);

    return this.getUserWithPhoto(user.id);
  }

  public async updateUser(user: User, userDto: UpdateUserDto): Promise<User> {
    const newPhoto = new Photo({ photo: userDto.photo });

    await this.photoRepository.save(newPhoto);

    const updatedUser = new User({
      ...user,
      photo: newPhoto,
      userName: userDto.userName,
      password: await this.hashPassword(userDto.password),
    });

    return await this.usersRepository.save(updatedUser);
  }

  public async delete(id: number): Promise<DeleteResult> {
    return await this.getUsersBaseQuery().delete().where({ id }).execute();
  }
}
