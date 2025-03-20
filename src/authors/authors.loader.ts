import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { AuthorsService } from '@/authors/services/authors.service';
import { AuthorEntity } from '@/authors/entities/author.entity';

/** DataLoader for authors for batching optimization in resolvers */
@Injectable({ scope: Scope.REQUEST })
export class AuthorsLoader {
  constructor(private readonly authorsService: AuthorsService) {}

  readonly batchAuthors = new DataLoader<string, AuthorEntity[]>(
    async (bookIds: string[]) => {
      const authors = await this.authorsService.findByBooks(bookIds);

      // Group authors by book id
      const authorsMap = new Map<string, AuthorEntity[]>();
      authors.forEach((author) => {
        author.books.forEach((book) => {
          if (!authorsMap.has(book.id)) {
            authorsMap.set(book.id, []);
          }

          authorsMap.get(book.id)?.push(author);
        });
      });

      return bookIds.map((id) => authorsMap.get(id) || []);
    },
  );
}
