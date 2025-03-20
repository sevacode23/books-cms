import {
  Parent,
  ResolveField,
  Resolver,
  Mutation,
  Args,
  Query,
} from '@nestjs/graphql';

import { Book } from '@/books/entities/book.model';
import { BooksLoader } from '@/books/books.loader';
import { UseGqlAuthGuard } from '@/auth/guards/gql-auth.guard';
import { ActivityLog } from '@/activity-logs/interceptors/activity-log.interceptor';

import { Author } from './entities/author.model';
import { AuthorsService } from './services/authors.service';
import { CreateAuthorInput } from './dtos/create-author.input';
import { GetAuthorsArgs } from './dtos/get-authors.args';

/**
 * Resolver for the Author object type
 */
@Resolver(() => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: AuthorsService,
    private booksLoader: BooksLoader,
  ) {}

  /**
   * ResolveField: Resolves the books field
   */
  @ResolveField('books', () => [Book])
  getBooks(@Parent() author: Author) {
    return this.booksLoader.batchBooks.load(author.id);
  }
  /**
   * Query: Get a single author by their ID
   */
  @Query(() => Author, { name: 'author', nullable: true })
  @UseGqlAuthGuard()
  @ActivityLog('GET_AUTHOR')
  getAuthor(@Args() args: GetAuthorsArgs) {
    return this.authorsService.findOneBy(args);
  }

  /**
   * Query: Get all authors
   */
  @Query(() => [Author], { name: 'authors', nullable: 'items' })
  @UseGqlAuthGuard()
  @ActivityLog('GET_AUTHORS')
  getAuthors(@Args() args: GetAuthorsArgs) {
    return this.authorsService.findBy(args);
  }

  /**
   * Mutation: Create a new author
   */
  @Mutation(() => Author)
  @UseGqlAuthGuard()
  @ActivityLog('CREATE_AUTHOR')
  createAuthor(@Args('input') input: CreateAuthorInput) {
    return this.authorsService.create(input);
  }
}
