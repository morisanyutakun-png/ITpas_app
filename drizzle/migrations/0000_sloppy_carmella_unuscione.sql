CREATE TYPE "public"."attempt_result" AS ENUM('correct', 'incorrect', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."exam_season" AS ENUM('spring', 'autumn', 'annual');--> statement-breakpoint
CREATE TYPE "public"."format_type" AS ENUM('definition', 'comparison', 'case', 'table_read', 'calculation', 'pseudo_lang', 'spreadsheet', 'security_case', 'biz_analysis', 'law_ip', 'network_basics', 'db_basics');--> statement-breakpoint
CREATE TYPE "public"."major_category" AS ENUM('strategy', 'management', 'technology');--> statement-breakpoint
CREATE TYPE "public"."material_type" AS ENUM('term_compare', 'diagram', 'pseudo_lang_helper', 'spreadsheet_helper', 'concept_note', 'cheatsheet');--> statement-breakpoint
CREATE TYPE "public"."relation_type" AS ENUM('is_a', 'part_of', 'contrast_with', 'depends_on', 'see_also');--> statement-breakpoint
CREATE TYPE "public"."session_mode" AS ENUM('weakness', 'topic', 'year', 'format', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."trap_type" AS ENUM('similar_term', 'scope_overgeneral', 'negation_miss', 'abbrev_mix', 'order_swap', 'edge_case_miss', 'none');--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_choice_label" char(1),
	"result" "attempt_result" NOT NULL,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"session_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "choices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"label" char(1) NOT NULL,
	"body" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"why_attractive" text,
	"misconception_slug" text
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"type" "material_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"source_file_path" text,
	"source_page_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "misconceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"definition" text NOT NULL,
	"typical_example" text DEFAULT '' NOT NULL,
	"counter_example" text DEFAULT '' NOT NULL,
	"recovery_hint" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_materials" (
	"question_id" uuid NOT NULL,
	"material_id" uuid NOT NULL,
	"role" text DEFAULT 'helper' NOT NULL,
	CONSTRAINT "question_materials_question_id_material_id_pk" PRIMARY KEY("question_id","material_id")
);
--> statement-breakpoint
CREATE TABLE "question_misconceptions" (
	"question_id" uuid NOT NULL,
	"misconception_id" uuid NOT NULL,
	"weight" real DEFAULT 1 NOT NULL,
	CONSTRAINT "question_misconceptions_question_id_misconception_id_pk" PRIMARY KEY("question_id","misconception_id")
);
--> statement-breakpoint
CREATE TABLE "question_topics" (
	"question_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	"weight" real DEFAULT 1 NOT NULL,
	CONSTRAINT "question_topics_question_id_topic_id_pk" PRIMARY KEY("question_id","topic_id")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_key" text NOT NULL,
	"exam_year" integer NOT NULL,
	"exam_season" "exam_season" NOT NULL,
	"question_number" integer NOT NULL,
	"stem" text NOT NULL,
	"correct_choice_label" char(1) NOT NULL,
	"major_category" "major_category" NOT NULL,
	"format_type" "format_type" NOT NULL,
	"trap_type" "trap_type" DEFAULT 'none' NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"source_file_path" text,
	"source_page_number" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"mode" "session_mode" NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"question_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_count" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "topic_materials" (
	"topic_id" uuid NOT NULL,
	"material_id" uuid NOT NULL,
	CONSTRAINT "topic_materials_topic_id_material_id_pk" PRIMARY KEY("topic_id","material_id")
);
--> statement-breakpoint
CREATE TABLE "topic_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_topic_id" uuid NOT NULL,
	"to_topic_id" uuid NOT NULL,
	"relation_type" "relation_type" NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"major_category" "major_category" NOT NULL,
	"minor_topic" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anon_key" text NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_anon_key_unique" UNIQUE("anon_key")
);
--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "choices" ADD CONSTRAINT "choices_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_materials" ADD CONSTRAINT "question_materials_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_materials" ADD CONSTRAINT "question_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_misconceptions" ADD CONSTRAINT "question_misconceptions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_misconceptions" ADD CONSTRAINT "question_misconceptions_misconception_id_misconceptions_id_fk" FOREIGN KEY ("misconception_id") REFERENCES "public"."misconceptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_topics" ADD CONSTRAINT "question_topics_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_topics" ADD CONSTRAINT "question_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_materials" ADD CONSTRAINT "topic_materials_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_materials" ADD CONSTRAINT "topic_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_relations" ADD CONSTRAINT "topic_relations_from_topic_id_topics_id_fk" FOREIGN KEY ("from_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_relations" ADD CONSTRAINT "topic_relations_to_topic_id_topics_id_fk" FOREIGN KEY ("to_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "choices_question_label_idx" ON "choices" USING btree ("question_id","label");--> statement-breakpoint
CREATE UNIQUE INDEX "materials_slug_idx" ON "materials" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "misconceptions_slug_idx" ON "misconceptions" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_external_key_idx" ON "questions" USING btree ("external_key");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");