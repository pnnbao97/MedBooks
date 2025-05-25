ALTER TABLE "books" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_slug_unique" UNIQUE("slug");