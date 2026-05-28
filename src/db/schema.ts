import { pgTable, uuid, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  nickname: text("nickname").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    majorName: text("major_name").notNull(),
    minorName: text("minor_name").notNull(),
    displayOrder: integer("display_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("idx_categories_major_name").on(table.majorName)]
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    text: text("text").notNull(),
    answers: text("answers").array().notNull(),
    closeAnswers: text("close_answers").array().default([]),
    categoryId: uuid("category_id").references(() => categories.id),
    authorId: uuid("author_id").references(() => users.id),
    difficulty: integer("difficulty").default(1),
    status: text("status").default("approved"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("idx_questions_author_id").on(table.authorId)]
);

export const playRecords = pgTable(
  "play_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
    userId: uuid("user_id").references(() => users.id),
    userName: text("user_name"),
    buzzTimeMs: integer("buzz_time_ms"),
    buzzCharIndex: integer("buzz_char_index"),
    answerTimeMs: integer("answer_time_ms"),
    isCorrect: boolean("is_correct"),
    normalizedAnswer: text("normalized_answer"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_play_records_question_id").on(table.questionId),
    index("idx_play_records_question_correct").on(table.questionId, table.isCorrect),
    index("idx_play_records_created_at").on(table.createdAt),
    index("idx_play_records_user_id").on(table.userId),
  ]
);
