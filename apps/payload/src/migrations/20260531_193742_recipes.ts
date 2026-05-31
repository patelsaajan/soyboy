import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "recipes_suggestions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "recipes_nutritional" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "_recipes_v_version_suggestions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_recipes_v_version_nutritional" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "recipes" RENAME COLUMN "hero_image_id" TO "featured_image_id";
  ALTER TABLE "_recipes_v" RENAME COLUMN "version_hero_image_id" TO "version_featured_image_id";
  ALTER TABLE "recipes" DROP CONSTRAINT "recipes_hero_image_id_media_id_fk";
  
  ALTER TABLE "_recipes_v" DROP CONSTRAINT "_recipes_v_version_hero_image_id_media_id_fk";
  
  DROP INDEX "recipes_hero_image_idx";
  DROP INDEX "_recipes_v_version_version_hero_image_idx";
  ALTER TABLE "recipes" ADD COLUMN "cuisine" varchar;
  ALTER TABLE "recipes" ADD COLUMN "time" varchar;
  ALTER TABLE "recipes" ADD COLUMN "img_src" varchar;
  ALTER TABLE "recipes" ADD COLUMN "intro" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_cuisine" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_time" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_img_src" varchar;
  ALTER TABLE "_recipes_v" ADD COLUMN "version_intro" varchar;
  ALTER TABLE "recipes_suggestions" ADD CONSTRAINT "recipes_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recipes_nutritional" ADD CONSTRAINT "recipes_nutritional_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_suggestions" ADD CONSTRAINT "_recipes_v_version_suggestions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_recipes_v_version_nutritional" ADD CONSTRAINT "_recipes_v_version_nutritional_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_recipes_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "recipes_suggestions_order_idx" ON "recipes_suggestions" USING btree ("_order");
  CREATE INDEX "recipes_suggestions_parent_id_idx" ON "recipes_suggestions" USING btree ("_parent_id");
  CREATE INDEX "recipes_nutritional_order_idx" ON "recipes_nutritional" USING btree ("_order");
  CREATE INDEX "recipes_nutritional_parent_id_idx" ON "recipes_nutritional" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_suggestions_order_idx" ON "_recipes_v_version_suggestions" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_suggestions_parent_id_idx" ON "_recipes_v_version_suggestions" USING btree ("_parent_id");
  CREATE INDEX "_recipes_v_version_nutritional_order_idx" ON "_recipes_v_version_nutritional" USING btree ("_order");
  CREATE INDEX "_recipes_v_version_nutritional_parent_id_idx" ON "_recipes_v_version_nutritional" USING btree ("_parent_id");
  ALTER TABLE "recipes" ADD CONSTRAINT "recipes_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "recipes_featured_image_idx" ON "recipes" USING btree ("featured_image_id");
  CREATE INDEX "_recipes_v_version_version_featured_image_idx" ON "_recipes_v" USING btree ("version_featured_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "recipes_suggestions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "recipes_nutritional" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipes_v_version_suggestions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_recipes_v_version_nutritional" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "recipes_suggestions" CASCADE;
  DROP TABLE "recipes_nutritional" CASCADE;
  DROP TABLE "_recipes_v_version_suggestions" CASCADE;
  DROP TABLE "_recipes_v_version_nutritional" CASCADE;
  ALTER TABLE "recipes" RENAME COLUMN "featured_image_id" TO "hero_image_id";
  ALTER TABLE "_recipes_v" RENAME COLUMN "version_featured_image_id" TO "version_hero_image_id";
  ALTER TABLE "recipes" DROP CONSTRAINT "recipes_featured_image_id_media_id_fk";
  
  ALTER TABLE "_recipes_v" DROP CONSTRAINT "_recipes_v_version_featured_image_id_media_id_fk";
  
  DROP INDEX "recipes_featured_image_idx";
  DROP INDEX "_recipes_v_version_version_featured_image_idx";
  ALTER TABLE "recipes" ADD CONSTRAINT "recipes_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_recipes_v" ADD CONSTRAINT "_recipes_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "recipes_hero_image_idx" ON "recipes" USING btree ("hero_image_id");
  CREATE INDEX "_recipes_v_version_version_hero_image_idx" ON "_recipes_v" USING btree ("version_hero_image_id");
  ALTER TABLE "recipes" DROP COLUMN "cuisine";
  ALTER TABLE "recipes" DROP COLUMN "time";
  ALTER TABLE "recipes" DROP COLUMN "img_src";
  ALTER TABLE "recipes" DROP COLUMN "intro";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_cuisine";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_time";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_img_src";
  ALTER TABLE "_recipes_v" DROP COLUMN "version_intro";`)
}
