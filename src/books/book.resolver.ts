import { Mutation, Parent, ResolveField } from '@nestjs/graphql';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { AuthorsLoader } from '@/authors/authors.loader';
import { Author } from '@/authors/entities/author.model';
import { ActivityLog } from '@/activity-logs/interceptors/activity-log.interceptor';
import { UseGqlAuthGuard } from '@/auth/guards/gql-auth.guard';

import { Book } from './entities/book.model';
import { BooksService } from './services/books.service';
import { CreateBookInput } from './dtos/create-book.input';
import { AddBookAuthorsInput } from './dtos/add-book-authors.input';
import { RemoveBookAuthorsInput } from './dtos/remove-book-authors.input';
import { UpdateBookInput } from './dtos/update-book.input';
import { SearchBooksInput } from './dtos/search-books.input';

/**
 * Resolver for the Book object type
 */
@Resolver(() => Book)
export class BooksResolver {
  constructor(
    private booksService: BooksService,
    private authorsLoader: AuthorsLoader,
  ) {}

  /**
   * ResolveField: Resolves the authors field using DataLoader
   */
  @ResolveField('authors', () => [Author])
  getAuthors(@Parent() book: Book) {
    return this.authorsLoader.batchAuthors.load(book.id);
  }

  /**
   * Query: Gets a single book by its ID
   */
  @Query(() => Book, { name: 'book', nullable: true })
  @UseGqlAuthGuard()
  @ActivityLog('GET_BOOK')
  async getBook(@Args('id') id: string) {
    return this.booksService.findOneById(id);
  }

  /**
   * Query: Searches books applying filters, sorting and pagination
   */
  @Query(() => [Book], { name: 'books' })
  @UseGqlAuthGuard()
  @ActivityLog('SEARCH_BOOKS')
  async searchBooks(@Args('input') args: SearchBooksInput) {
    return this.booksService.searchBooks(args);
  }

  /**
   * Mutation: Creates a new book
   */
  @Mutation(() => Book)
  @UseGqlAuthGuard()
  @ActivityLog('CREATE_BOOK')
  async createBook(@Args('input') input: CreateBookInput) {
    return this.booksService.create(input);
  }

  /**
   * Mutation: Updates a book
   */
  @Mutation(() => Book)
  @UseGqlAuthGuard()
  @ActivityLog('UPDATE_BOOK')
  async updateBook(@Args('input') input: UpdateBookInput) {
    return this.booksService.update(input);
  }

  /**
   * Mutation: Links authors to a book
   */
  @Mutation(() => Book)
  @UseGqlAuthGuard()
  @ActivityLog('ADD_BOOK_AUTHORS')
  async addBookAuthors(@Args('input') input: AddBookAuthorsInput) {
    return this.booksService.addAuthors(input.id, input.authorIds);
  }

  /**
   * Mutation: Removes authors from a book
   */
  @Mutation(() => Book)
  @UseGqlAuthGuard()
  @ActivityLog('REMOVE_BOOK_AUTHORS')
  async removeBookAuthors(@Args('input') input: RemoveBookAuthorsInput) {
    return this.booksService.removeAuthors(input.id, input.authorIds);
  }

  /**
   * Mutation: Removes a book
   */
  @Mutation(() => Book, { nullable: true })
  @UseGqlAuthGuard()
  @ActivityLog('REMOVE_BOOK')
  async removeBook(@Args('id') id: string) {
    await this.booksService.remove(id);
    return null;
  }
}
