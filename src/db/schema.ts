import { pgTable, uuid, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  text: text("text").notNull(),
  answers: text("answers").array().notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  difficulty: integer("difficulty").default(1),
  status: text("status").default("approved"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playRecords = pgTable(
  "play_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),
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
  ]
);
