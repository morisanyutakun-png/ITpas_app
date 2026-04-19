CREATE TYPE "public"."origin_type" AS ENUM('ipa_actual', 'ipa_inspired', 'original');--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "origin_type" "origin_type" DEFAULT 'ipa_inspired' NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "source_note" text;