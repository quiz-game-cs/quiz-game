import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { asc, eq } from "drizzle-orm";
import { questions, categories } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// One new code per question, in the same created_at ASC order as the
// snapshot taken on 2026-05-28 (53 rows). See notes/mapping-questions.md.
const NEW_CODES: string[] = [
  "0306", // 1. 세종대왕
  "0306", // 2. 임진왜란
  "0306", // 3. 3.1운동
  "0602", // 4. 피라미드
  "0307", // 5. 바스티유
  "0306", // 6. 한국전쟁
  "0602", // 7. 만리장성
  "0306", // 8. 광복절
  "0201", // 9. 만유인력
  "0202", // 10. H2O
  "0205", // 11. 목성
  "0201", // 12. E=mc2
  "0203", // 13. 혈액
  "0205", // 14. 지구
  "0203", // 15. 진화론
  "0202", // 16. 금
  "0205", // 17. 우주
  "0301", // 18. 서울
  "0302", // 19. 에베레스트
  "0302", // 20. 나일강
  "0302", // 21. 아마존
  "0302", // 22. 스페인
  "0302", // 23. 호주
  "0104", // 24. 햄릿
  "0601", // 25. 모나리자
  "0701", // 26. 베토벤 9번
  "0104", // 27. 해리포터
  "0601", // 28. 절규
  "0206", // 29. 파이
  "0206", // 30. 피타고라스
  "0206", // 31. 피보나치
  "0808", // 32. 올림픽
  "0801", // 33. 축구
  "0802", // 34. 류현진(야구)
  "0405", // 35. 추석
  "0401", // 36. 에스프레소
  "0401", // 37. 초밥
  "0207", // 38. 애플
  "0207", // 39. 인터넷
  "0207", // 40. 페이스북
  "0207", // 41. ChatGPT
  "0901", // 42. 기생충
  "0901", // 43. 스타워즈
  "1001", // 44. 미키마우스
  "0401", // 45. 피자
  "0401", // 46. 김치
  "0203", // 47. 판다
  "0203", // 48. 사자
  "0203", // 49. 대왕고래
  "1002", // 50. 마리오
  "1002", // 51. 포켓몬
  "1001", // 52. 원피스
  "9999", // 53. 테스트
];

async function main() {
  // Load all categories with codes — build code → id lookup.
  const cats = await db.select().from(categories);
  const codeToId = new Map<string, string>();
  for (const c of cats) {
    if (c.code) codeToId.set(c.code, c.id);
  }

  // Verify all target codes exist before touching anything.
  const missing = NEW_CODES.filter((code) => !codeToId.has(code));
  if (missing.length > 0) {
    console.error("missing categories for codes:", [...new Set(missing)]);
    process.exit(1);
  }

  // Load questions in the same order used in the mapping table.
  const qs = await db.select().from(questions).orderBy(asc(questions.createdAt));

  if (qs.length !== NEW_CODES.length) {
    console.error(
      `question count mismatch — expected ${NEW_CODES.length}, found ${qs.length}.`
    );
    console.error("Aborting. Did a teammate add new questions since the snapshot?");
    process.exit(1);
  }

  console.log(`Remapping ${qs.length} questions...`);
  let updated = 0;
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    const code = NEW_CODES[i];
    const newCatId = codeToId.get(code)!;
    if (q.categoryId === newCatId) continue; // already correct
    await db.update(questions).set({ categoryId: newCatId }).where(eq(questions.id, q.id));
    updated++;
    console.log(`  [${i + 1}] ${q.text.slice(0, 30)}... → ${code}`);
  }
  console.log(`Done. Updated ${updated} of ${qs.length} questions.`);
}

main().catch((e) => {
  console.error("Remap failed:", e);
  process.exit(1);
});
