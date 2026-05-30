import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { questions } from "./schema";
import fs from "fs";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

type OriginalRow = {
  id: string;
  text: string;
  answers: string[];
};

async function main() {
  const md = fs.readFileSync(
    "notes/questions-pre-remap-2026-05-28.md",
    "utf-8"
  );
  const match = md.match(/```json\n([\s\S]+?)\n```/);
  if (!match) {
    console.error("could not find JSON block in backup");
    process.exit(1);
  }
  const rows: OriginalRow[] = JSON.parse(match[1]);
  if (rows.length !== 53) {
    console.error(`expected 53 rows in backup, got ${rows.length}`);
    process.exit(1);
  }

  console.log(`Reverting ${rows.length} questions to pre-polish text/answers...`);
  let reverted = 0;
  for (const r of rows) {
    const result = await db
      .update(questions)
      .set({ text: r.text, answers: r.answers, authorId: null })
      .where(eq(questions.id, r.id))
      .returning({ id: questions.id });
    if (result.length === 0) {
      console.warn(`  ! id not found: ${r.id} (${r.text.slice(0, 30)}...)`);
    } else {
      reverted++;
    }
  }
  console.log(`Reverted ${reverted}/${rows.length} rows.`);
}

main().catch((e) => {
  console.error("revert failed:", e);
  process.exit(1);
});
