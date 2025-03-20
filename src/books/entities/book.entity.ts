import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';

import { AuthorEntity } from '@/authors/entities/author.entity';

/**
 * Represents a book in the database
 */
@Entity('books')
export class BookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Stored as unique field for exact searches
   * Used a simple B-Tree index
   */
  @Column({ length: 20, unique: true })
  @Index('idx_books_isbn')
  isbn: string;

  /**
   * Title for substring or full-text search
   * (GIN index to be created via a migration)
   */
  @Column({ length: 255 })
  title: string;

  /**
   * Full datetime.
   * Used a B-Tree index for range queries.
   */
  @Column({ type: 'timestamptz' })
  @Index('idx_books_published_at')
  publishedAt: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50 })
  language: string;

  @Column({ type: 'int' })
  pageCount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToMany(() => AuthorEntity, (author) => author.books, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'book_authors' })
  authors: AuthorEntity[];
}
