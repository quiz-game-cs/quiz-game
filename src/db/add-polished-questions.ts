import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { asc, eq, isNull, and } from "drizzle-orm";
import { questions, users } from "./schema";
import { POLISHED } from "./polished-data";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  // 1) inseop user (exists from previous script, but ensure)
  let user = await db.select().from(users).where(eq(users.nickname, "inseop")).limit(1);
  if (user.length === 0) {
    [user[0]] = await db.insert(users).values({ nickname: "inseop" }).returning();
    console.log(`created user 'inseop': ${user[0].id}`);
  }
  const authorId = user[0].id;
  console.log(`author = inseop (${authorId})`);

  // 2) Take a snapshot of the ORIGINAL 53 questions only (author_id IS NULL).
  //    This avoids picking up any previously-inserted polished rows if the
  //    script is rerun.
  const originals = await db
    .select()
    .from(questions)
    .where(isNull(questions.authorId))
    .orderBy(asc(questions.createdAt));

  if (originals.length !== 53) {
    console.error(
      `expected 53 original (author NULL) questions in created_at order, got ${originals.length}. Abort.`
    );
    process.exit(1);
  }

  // 3) Insert each polished row as a NEW question (do not touch the original).
  console.log(`Inserting ${POLISHED.length} polished questions as new rows...`);
  let inserted = 0;
  for (const p of POLISHED) {
    const original = originals[p.idx];
    if (!original) {
      console.error(`  ! original idx=${p.idx} missing. Abort.`);
      process.exit(1);
    }
    // Guard: do not duplicate-insert. If a question with this exact text +
    // author already exists, skip.
    const existing = await db
      .select({ id: questions.id })
      .from(questions)
      .where(and(eq(questions.text, p.text), eq(questions.authorId, authorId)))
      .limit(1);
    if (existing.length > 0) {
      console.log(`  [${p.idx + 1}] skip (already inserted)`);
      continue;
    }
    await db.insert(questions).values({
      text: p.text,
      answers: p.answers,
      categoryId: original.categoryId,
      authorId,
      difficulty: original.difficulty,
    });
    inserted++;
    console.log(`  [${p.idx + 1}] inserted: ${p.text.slice(0, 30)}...`);
  }

  console.log(`Done. Inserted ${inserted} new polished rows.`);
}

main().catch((e) => {
  console.error("add-polished failed:", e);
  process.exit(1);
});
