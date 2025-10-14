CREATE TABLE "devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"mac_address" varchar(17) NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wol_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"mac_address" varchar(17) NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "mac_address_idx" ON "devices" USING btree ("mac_address");