import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTextSearchIndexes1742228550825 implements MigrationInterface {
  name = 'AddTextSearchIndexes1742228550825';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) GIN for book titles
    await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS "idx_books_title_vector"
          ON "books"
          USING GIN (to_tsvector('english', "title"));
        `);

    // 2) GIN for author fullName
    await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS "idx_authors_fullname_vector"
          ON "authors"
          USING GIN (to_tsvector('english', "fullName"));
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DROP INDEX IF EXISTS "idx_authors_fullname_vector";
        `);
    await queryRunner.query(`
          DROP INDEX IF EXISTS "idx_books_title_vector";
        `);
  }
}
