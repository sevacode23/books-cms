import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1742228519677 implements MigrationInterface {
  name = 'InitSchema1742228519677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "authors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying(200) NOT NULL, "birthDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d2ed02fabd9b52847ccb85e6b88" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isbn" character varying(20) NOT NULL, "title" character varying(255) NOT NULL, "publishedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "description" text, "language" character varying(50) NOT NULL, "pageCount" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn"), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_books_isbn" ON "books" ("isbn") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_books_published_at" ON "books" ("publishedAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "book_authors" ("booksId" uuid NOT NULL, "authorsId" uuid NOT NULL, CONSTRAINT "PK_18f6a6b12443482633f12afcf45" PRIMARY KEY ("booksId", "authorsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff5586c52ab93d4bb395befd9b" ON "book_authors" ("booksId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_82b9742e988d535ebf8a66283f" ON "book_authors" ("authorsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "book_authors" ADD CONSTRAINT "FK_ff5586c52ab93d4bb395befd9b3" FOREIGN KEY ("booksId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_authors" ADD CONSTRAINT "FK_82b9742e988d535ebf8a66283fc" FOREIGN KEY ("authorsId") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_authors" DROP CONSTRAINT "FK_82b9742e988d535ebf8a66283fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_authors" DROP CONSTRAINT "FK_ff5586c52ab93d4bb395befd9b3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_82b9742e988d535ebf8a66283f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff5586c52ab93d4bb395befd9b"`,
    );
    await queryRunner.query(`DROP TABLE "book_authors"`);
    await queryRunner.query(`DROP INDEX "public"."idx_books_published_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_books_isbn"`);
    await queryRunner.query(`DROP TABLE "books"`);
    await queryRunner.query(`DROP TABLE "authors"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
