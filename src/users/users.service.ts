import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/users.entity';
import { Repository } from 'typeorm';
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

  public async findUser(userDto: CreateUserDto): Promise<User> {
    return await this.usersRepository.findOne({
      where: [{ login: userDto.login }, { userName: userDto.userName }],
    });
  }

  public async getAll() {
    return await this.usersRepository.find();
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
    const newPhoto = new Photo({ photo: userDto.photo });
    await this.photoRepository.insert(newPhoto);

    const user = new User({
      login: userDto.login,
      userName: userDto.userName,
      photo: newPhoto,
      password: await this.hashPassword(userDto.password),
    });

    await this.usersRepository.save(user);
    return (await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.photo', 'p')
      .where({ id: user.id })
      .getOne()
      .then((user: User & { photo: { id: string; photo: string } }) => ({
        ...user,
        photo: user.photo.photo,
      }))) as User;
  }

  public async updateUser(user: User, userDto: UpdateUserDto): Promise<any> {
    const newPhoto = new Photo({ photo: userDto.photo });
    await this.photoRepository.insert(newPhoto);

    const updatedUser = new User({
      ...user,
      photo: newPhoto,
      userName: userDto.userName,
      password: await this.hashPassword(userDto.password),
    });

    await this.usersRepository.save(updatedUser);

    return await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.photo', 'p')
      .getOne()
      .then((user: User & { photo: { id: string; photo: string } }) => ({
        ...user,
        photo: user.photo.photo,
      }));
  }

  delete = async (id: number) => {
    const isExist = await this.usersRepository.findOneBy({ id });

    if (isExist) {
      await this.usersRepository.delete({ id });
      return `User ${id} was removed successfully`;
    }

    throw new HttpException(
      "Incorrect data or user doesn't exist",
      HttpStatus.BAD_REQUEST,
    );
  };
}
