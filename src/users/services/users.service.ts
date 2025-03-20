import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { CreateUserDto } from '../dtos/create-user.dto';
import { UserEntity } from '../entities/user.entity';

/** Options for finding users */
type TFindOptions =
  | FindOptionsWhere<UserEntity>
  | FindOptionsWhere<UserEntity>[];

/** Service for managing users */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  /** Finds a single user by criteria
   * @param options - The criteria to find the user by
   * @returns The user entity that matches the criteria or null if not found
   */
  findOneBy(options: TFindOptions) {
    return this.usersRepository.findOneBy(options);
  }

  /** Finds multiple users by criteria
   * @param options - The criteria to find the users by
   * @returns The user entities that match the criteria
   */
  findBy(options: TFindOptions) {
    return this.usersRepository.findBy(options);
  }

  /** Creates a new user
   * @param createUserDto - The input data to create the user
   * @returns The created user entity
   */
  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;

    const existingUser = await this.findOneBy({ email });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = this.usersRepository.create(createUserDto);

    return this.usersRepository.save(user);
  }
}
