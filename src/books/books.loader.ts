import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';

import { BooksService } from '@/books/services/books.service';
import { BookEntity } from '@/books/entities/book.entity';

/** DataLoader for books for batching optimization in resolvers */
@Injectable({ scope: Scope.REQUEST })
export class BooksLoader {
  constructor(private readonly booksService: BooksService) {}

  readonly batchBooks = new DataLoader<string, BookEntity[]>(
    async (authorIds: string[]) => {
      const books = await this.booksService.findByAuthors(authorIds);

      // Group books by author id
      const booksMap = new Map<string, BookEntity[]>();

      books.forEach((book) => {
        book.authors.forEach((author) => {
          if (!booksMap.has(author.id)) {
            booksMap.set(author.id, []);
          }
          booksMap.get(author.id)?.push(book);
        });
      });

      return authorIds.map((id) => booksMap.get(id) || []);
    },
  );
}
