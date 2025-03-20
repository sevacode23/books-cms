import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { AuthorEntity } from '../entities/author.entity';
import { CreateAuthorInput } from '../dtos/create-author.input';

/** Author search criteria options */
type TFindOptions =
  | FindOptionsWhere<AuthorEntity>
  | FindOptionsWhere<AuthorEntity>[];

/** Service for managing authors */
@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(AuthorEntity)
    private readonly authorRepository: Repository<AuthorEntity>,
  ) {}

  /** Finds a single author by criteria
   * @param options - The criteria to find the author by
   * @returns The author entity that matches the criteria or null if not found
   */
  findOneBy(options: TFindOptions) {
    return this.authorRepository.findOneBy(options);
  }

  /** Finds multiple authors by criteria
   * @param options - The criteria to find the authors by
   * @returns The author entities that match the criteria
   */
  findBy(options: TFindOptions) {
    return this.authorRepository.findBy(options);
  }

  /** Finds authors by book IDs
   *  Needed for DataLoader optimization in resolvers
   */
  findByBooks(bookIds: string[]): Promise<AuthorEntity[]> {
    return this.authorRepository
      .createQueryBuilder('author')
      .leftJoinAndSelect('author.books', 'book')
      .where('book.id IN (:...bookIds)', { bookIds })
      .getMany();
  }

  /** Creates a new author
   * @param input - The input data to create the author
   * @returns The created author entity
   */
  create(input: CreateAuthorInput) {
    const author = this.authorRepository.create(input);
    return this.authorRepository.save(author);
  }
}
