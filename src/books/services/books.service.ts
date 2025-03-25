import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';

import { AuthorEntity } from '@/authors/entities/author.entity';

import { BookEntity } from '../entities/book.entity';
import { CreateBookInput } from '../dtos/create-book.input';
import { UpdateBookInput } from '../dtos/update-book.input';
import { SearchBooksInput } from '../dtos/search-books.input';

import { BooksQueryService } from './books-query.service';
import { BooksCacheService } from './books-cache.service';

/** Book search criteria options */
type TFindOptions =
  | FindOptionsWhere<BookEntity>
  | FindOptionsWhere<BookEntity>[];

/** Service for managing books */
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly booksRepository: Repository<BookEntity>,
    private dataSource: DataSource,
    private booksQueryService: BooksQueryService,
    private booksCacheService: BooksCacheService,
  ) {}

  /** Finds a single book by criteria
   * @param options - The criteria to find the book by
   * @returns The book entity that matches the criteria or null if not found
   */
  findOneBy(options: TFindOptions): Promise<BookEntity | null> {
    return this.booksRepository.findOneBy(options);
  }

  /** Finds multiple books by criteria
   * @param options - The criteria to find the books by
   * @returns The book entities that match the criteria
   */
  findBy(options: TFindOptions): Promise<BookEntity[]> {
    return this.booksRepository.findBy(options);
  }

  /** Finds a single book and cache it by ID or returns cached book if exists
   * @param id - The ID of the book to find
   * @returns The book entity that matches the ID or null if not found
   */
  async findOneById(id: string): Promise<BookEntity | null> {
    const cachedBook = await this.booksCacheService.getOne(id);

    if (cachedBook) {
      return cachedBook;
    }

    const book = await this.findOneBy({ id });

    if (book) {
      void this.booksCacheService.setOne(id, book);
    }

    return book;
  }

  /** Finds books by author IDs
   *  Needed for DataLoader optimization in resolvers
   */
  async findByAuthors(authorIds: string[]): Promise<BookEntity[]> {
    return this.booksRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.authors', 'author')
      .where('author.id IN (:...authorIds)', { authorIds })
      .getMany();
  }

  /** Searches for books using filters, sorting and pagination
   *  Uses cache by input if amount of results is less than max and the filter is not provided
   *
   * @param input - The input data to search for books
   * @returns The books that match the criteria
   */
  async searchBooks(input: SearchBooksInput): Promise<BookEntity[]> {
    const { filter, sort, offset, limit } = input;

    const cachedBooks = await this.booksCacheService.getSearch(input);

    if (cachedBooks) {
      return cachedBooks;
    }

    // QueryBuilder on book table and join authors for author name filtering
    const qb = this.booksRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.authors', 'author');

    this.booksQueryService.applyFilters(qb, filter);
    this.booksQueryService.applySorting(qb, sort);
    this.booksQueryService.applyPagination(qb, offset, limit);

    const books = await qb.getMany();

    void this.booksCacheService.cacheSearch(input, books);

    return books;
  }

  /** Creates a new book with optional author links
   * @param input - The input data to create the book
   * @returns The created book entity
   */
  async create(input: CreateBookInput): Promise<BookEntity> {
    const { authorIds, ...bookData } = input;

    // Use transaction to ensure data integrity
    return this.dataSource.transaction(async (manager) => {
      const book = manager.create(BookEntity, bookData);

      // Save book to DB and get the version with ID
      const savedBook = await manager.save(book);

      if (authorIds?.length) {
        // Find all authors by provided IDs
        const authors = await manager.findBy(AuthorEntity, {
          id: In(authorIds),
        });

        // Verify all authors exist
        if (authors.length !== authorIds.length) {
          throw new NotFoundException('Some authors were not found');
        }

        // Link authors to the book
        savedBook.authors = authors;
      }

      const createdBook = await manager.save(savedBook);

      // Clear all search results from cache
      await this.booksCacheService.clearSearch();

      return createdBook;
    });
  }

  /** Updates a book with new data
   * @param input - The input data to update the book
   * @returns The updated book entity
   */
  async update(input: UpdateBookInput): Promise<BookEntity> {
    const { id, ...bookData } = input;

    // Find requested book
    const book = await this.findOneBy({ id });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    const updatedBook = await this.booksRepository.save(
      Object.assign(book, bookData),
    );

    // Clear book by id and all search results from cache
    await this.booksCacheService.clearOneWithSearch(id);

    return updatedBook;
  }

  /** Links new authors to a book */
  async addAuthors(bookId: string, authorIds: string[]): Promise<BookEntity> {
    // Use transaction to ensure data integrity
    return this.dataSource.transaction(async (manager) => {
      const book = await manager.findOne(BookEntity, {
        where: { id: bookId },
        relations: ['authors'],
      });

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      // Find all authors by provided IDs
      const authors = await manager.findBy(AuthorEntity, {
        id: In(authorIds),
      });

      // Verify all authors exist
      if (authors.length !== authorIds.length) {
        throw new NotFoundException('Some authors were not found');
      }

      // Filter authors that are already linked to the book
      const newAuthors = authors.filter(
        (author) =>
          !book.authors.some(
            (existingAuthor) => existingAuthor.id === author.id,
          ),
      );

      // Add new authors to the book
      book.authors = [...book.authors, ...newAuthors];

      const updatedBook = await manager.save(book);

      // Clear book by id and all search results from cache
      await this.booksCacheService.clearOneWithSearch(bookId);

      return updatedBook;
    });
  }

  /** Removes authors from a book */
  async removeAuthors(
    bookId: string,
    authorIds: string[],
  ): Promise<BookEntity> {
    const book = await this.booksRepository.findOne({
      where: { id: bookId },
      relations: ['authors'],
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Filter authors to remove by ID
    book.authors = book.authors.filter(
      (author) => !authorIds.includes(author.id),
    );

    const updatedBook = await this.booksRepository.save(book);

    // Clear book by id and all search results from cache
    await this.booksCacheService.clearOneWithSearch(bookId);

    return updatedBook;
  }

  /** Removes a book by ID */
  async remove(id: string): Promise<Omit<BookEntity, 'id'>> {
    const book = await this.findOneBy({ id });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    await this.booksRepository.remove(book);

    // Clear book by id and all search results from cache
    await this.booksCacheService.clearOneWithSearch(id);

    return book;
  }
}
