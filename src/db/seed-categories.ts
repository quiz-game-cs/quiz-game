import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { categories } from "./schema";
import { CATEGORIES } from "./category-data";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log(`Seeding ${CATEGORIES.length} categories...`);
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < CATEGORIES.length; i++) {
    const entry = CATEGORIES[i];
    const result = await db
      .insert(categories)
      .values({
        code: entry.code,
        majorName: entry.majorName,
        minorName: entry.minorName,
        displayOrder: i + 1,
      })
      .onConflictDoNothing({ target: categories.code })
      .returning();
    if (result.length > 0) inserted++;
    else skipped++;
  }
  console.log(`Done. Inserted: ${inserted}, skipped (already existed): ${skipped}`);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
