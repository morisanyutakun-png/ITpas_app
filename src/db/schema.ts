import { relations, sql } from "drizzle-orm";
import {
  boolean,
  char,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ===== Enums =====

export const examSeasonEnum = pgEnum("exam_season", [
  "spring",
  "autumn",
  "annual",
]);

export const majorCategoryEnum = pgEnum("major_category", [
  "strategy",
  "management",
  "technology",
]);

export const formatTypeEnum = pgEnum("format_type", [
  "definition",
  "comparison",
  "case",
  "table_read",
  "calculation",
  "pseudo_lang",
  "spreadsheet",
  "security_case",
  "biz_analysis",
  "law_ip",
  "network_basics",
  "db_basics",
]);

export const trapTypeEnum = pgEnum("trap_type", [
  "similar_term",
  "scope_overgeneral",
  "negation_miss",
  "abbrev_mix",
  "order_swap",
  "edge_case_miss",
  "none",
]);

export const materialTypeEnum = pgEnum("material_type", [
  "term_compare",
  "diagram",
  "pseudo_lang_helper",
  "spreadsheet_helper",
  "concept_note",
  "cheatsheet",
]);

export const relationTypeEnum = pgEnum("relation_type", [
  "is_a",
  "part_of",
  "contrast_with",
  "depends_on",
  "see_also",
]);

export const attemptResultEnum = pgEnum("attempt_result", [
  "correct",
  "incorrect",
  "skipped",
]);

export const sessionModeEnum = pgEnum("session_mode", [
  "weakness",
  "topic",
  "year",
  "format",
  "mixed",
]);

export const originTypeEnum = pgEnum("origin_type", [
  "ipa_actual",      // Verbatim copy from IPA past exam (cited)
  "ipa_inspired",    // Original wording, inspired by IPA syllabus/topics
  "original",        // Fully original (not based on any past exam)
]);

// ===== Tables =====

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  anonKey: text("anon_key").notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    majorCategory: majorCategoryEnum("major_category").notNull(),
    minorTopic: text("minor_topic").notNull(),
    summary: text("summary").notNull().default(""),
    body: text("body").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("topics_slug_idx").on(t.slug),
  })
);

export const topicRelations = pgTable("topic_relations", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromTopicId: uuid("from_topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  toTopicId: uuid("to_topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  relationType: relationTypeEnum("relation_type").notNull(),
  note: text("note"),
});

export const misconceptions = pgTable(
  "misconceptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    definition: text("definition").notNull(),
    typicalExample: text("typical_example").notNull().default(""),
    counterExample: text("counter_example").notNull().default(""),
    recoveryHint: text("recovery_hint").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("misconceptions_slug_idx").on(t.slug),
  })
);

export const materials = pgTable(
  "materials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    type: materialTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    sourceFilePath: text("source_file_path"),
    sourcePageNumber: integer("source_page_number"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("materials_slug_idx").on(t.slug),
  })
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    externalKey: text("external_key").notNull(),
    examYear: integer("exam_year").notNull(),
    examSeason: examSeasonEnum("exam_season").notNull(),
    questionNumber: integer("question_number").notNull(),
    stem: text("stem").notNull(),
    correctChoiceLabel: char("correct_choice_label", { length: 1 }).notNull(),
    majorCategory: majorCategoryEnum("major_category").notNull(),
    formatType: formatTypeEnum("format_type").notNull(),
    trapType: trapTypeEnum("trap_type").notNull().default("none"),
    explanation: text("explanation").notNull().default(""),
    keyInsight: text("key_insight"),
    commonMistakeFlow: text("common_mistake_flow"),
    originType: originTypeEnum("origin_type").notNull().default("ipa_inspired"),
    sourceNote: text("source_note"),
    sourceFilePath: text("source_file_path"),
    sourcePageNumber: integer("source_page_number"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    externalKeyIdx: uniqueIndex("questions_external_key_idx").on(t.externalKey),
  })
);

export const choices = pgTable(
  "choices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    label: char("label", { length: 1 }).notNull(),
    body: text("body").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    whyAttractive: text("why_attractive"),
    misconceptionSlug: text("misconception_slug"),
  },
  (t) => ({
    qLabelIdx: uniqueIndex("choices_question_label_idx").on(t.questionId, t.label),
  })
);

export const questionTopics = pgTable(
  "question_topics",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    weight: real("weight").notNull().default(1.0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.questionId, t.topicId] }),
  })
);

export const questionMisconceptions = pgTable(
  "question_misconceptions",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    misconceptionId: uuid("misconception_id")
      .notNull()
      .references(() => misconceptions.id, { onDelete: "cascade" }),
    weight: real("weight").notNull().default(1.0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.questionId, t.misconceptionId] }),
  })
);

export const questionMaterials = pgTable(
  "question_materials",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    materialId: uuid("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("helper"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.questionId, t.materialId] }),
  })
);

export const topicMaterials = pgTable(
  "topic_materials",
  {
    topicId: uuid("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    materialId: uuid("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.topicId, t.materialId] }),
  })
);

export const attempts = pgTable("attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  selectedChoiceLabel: char("selected_choice_label", { length: 1 }),
  result: attemptResultEnum("result").notNull(),
  durationMs: integer("duration_ms").notNull().default(0),
  sessionId: uuid("session_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mode: sessionModeEnum("mode").notNull(),
  filters: jsonb("filters").notNull().default(sql`'{}'::jsonb`),
  questionIds: jsonb("question_ids").notNull().default(sql`'[]'::jsonb`),
  totalCount: integer("total_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

// ===== Drizzle Relations =====

export const questionsRelations = relations(questions, ({ many }) => ({
  choices: many(choices),
  questionTopics: many(questionTopics),
  questionMisconceptions: many(questionMisconceptions),
  questionMaterials: many(questionMaterials),
  attempts: many(attempts),
}));

export const choicesRelations = relations(choices, ({ one }) => ({
  question: one(questions, {
    fields: [choices.questionId],
    references: [questions.id],
  }),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  questionTopics: many(questionTopics),
  topicMaterials: many(topicMaterials),
  outRelations: many(topicRelations, { relationName: "from" }),
  inRelations: many(topicRelations, { relationName: "to" }),
}));

export const misconceptionsRelations = relations(misconceptions, ({ many }) => ({
  questionMisconceptions: many(questionMisconceptions),
}));

export const materialsRelations = relations(materials, ({ many }) => ({
  questionMaterials: many(questionMaterials),
  topicMaterials: many(topicMaterials),
}));

export const questionTopicsRelations = relations(questionTopics, ({ one }) => ({
  question: one(questions, {
    fields: [questionTopics.questionId],
    references: [questions.id],
  }),
  topic: one(topics, {
    fields: [questionTopics.topicId],
    references: [topics.id],
  }),
}));

export const questionMisconceptionsRelations = relations(
  questionMisconceptions,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionMisconceptions.questionId],
      references: [questions.id],
    }),
    misconception: one(misconceptions, {
      fields: [questionMisconceptions.misconceptionId],
      references: [misconceptions.id],
    }),
  })
);

export const questionMaterialsRelations = relations(
  questionMaterials,
  ({ one }) => ({
    question: one(questions, {
      fields: [questionMaterials.questionId],
      references: [questions.id],
    }),
    material: one(materials, {
      fields: [questionMaterials.materialId],
      references: [materials.id],
    }),
  })
);

export const topicMaterialsRelations = relations(topicMaterials, ({ one }) => ({
  topic: one(topics, {
    fields: [topicMaterials.topicId],
    references: [topics.id],
  }),
  material: one(materials, {
    fields: [topicMaterials.materialId],
    references: [materials.id],
  }),
}));

export const topicRelationsRelations = relations(topicRelations, ({ one }) => ({
  from: one(topics, {
    fields: [topicRelations.fromTopicId],
    references: [topics.id],
    relationName: "from",
  }),
  to: one(topics, {
    fields: [topicRelations.toTopicId],
    references: [topics.id],
    relationName: "to",
  }),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  user: one(users, { fields: [attempts.userId], references: [users.id] }),
  question: one(questions, {
    fields: [attempts.questionId],
    references: [questions.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  attempts: many(attempts),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
