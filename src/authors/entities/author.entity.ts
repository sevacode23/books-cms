import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';

import { BookEntity } from '@/books/entities/book.entity';

/**
 * Represents a book author in the database
 */
@Entity('authors')
export class AuthorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Full name for partial search
   * (GIN index to be created via a migration).
   */
  @Column({ length: 200 })
  fullName: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToMany(() => BookEntity, (book) => book.authors, {
    onDelete: 'CASCADE',
  })
  books: BookEntity[];
}
