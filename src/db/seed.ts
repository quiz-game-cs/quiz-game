import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { questions, playRecords } from "./schema";

const CHAR_INTERVAL_MS = 120;

const SEED_QUESTIONS = [
  { text: "대한민국의 수도는 어디인가?", answers: ["서울", "서울특별시"], category: "지리", difficulty: 1 },
  { text: "태양계에서 가장 큰 행성은?", answers: ["목성"], category: "과학", difficulty: 1 },
  { text: "물의 화학식은?", answers: ["H2O", "에이치투오"], category: "과학", difficulty: 1 },
  { text: "피카츄가 등장하는 게임 시리즈는?", answers: ["포켓몬", "포켓몬스터", "Pokemon"], category: "게임", difficulty: 1 },
  { text: "세종대왕이 창제한 문자는?", answers: ["한글", "훈민정음"], category: "역사", difficulty: 1 },
  { text: "지구에서 가장 높은 산은?", answers: ["에베레스트", "에베레스트산", "초모랑마"], category: "지리", difficulty: 2 },
  { text: "빛의 속도는 초속 약 몇 만 km인가?", answers: ["30", "30만"], category: "과학", difficulty: 3 },
  { text: "일본의 수도는?", answers: ["도쿄", "동경", "Tokyo"], category: "지리", difficulty: 1 },
  { text: "원주율 파이의 소수점 아래 두 자리까지는?", answers: ["3.14"], category: "수학", difficulty: 2 },
  { text: "해리포터 시리즈의 작가는?", answers: ["J.K.롤링", "롤링", "JK롤링", "조앤롤링"], category: "문학", difficulty: 2 },
  { text: "인체에서 가장 큰 장기는?", answers: ["간", "간장"], category: "과학", difficulty: 2 },
  { text: "지구의 자전 주기는 약 몇 시간인가?", answers: ["24", "24시간"], category: "과학", difficulty: 1 },
];

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const sql = neon(url);
  const db = drizzle(sql);

  console.log("시드 데이터 삽입 시작...");

  for (const q of SEED_QUESTIONS) {
    const [inserted] = await db.insert(questions).values(q).returning();
    console.log(`  문제 추가: ${q.text.slice(0, 20)}...`);

    const len = q.text.length;
    const ghostProfiles = [
      { name: "고스트A", ratio: 0.3 },
      { name: "고스트B", ratio: 0.6 },
      { name: "고스트C", ratio: 0.85 },
    ];

    for (const ghost of ghostProfiles) {
      const charIdx = Math.max(1, Math.round(len * ghost.ratio));
      await db.insert(playRecords).values({
        questionId: inserted.id,
        userName: ghost.name,
        buzzCharIndex: charIdx,
        buzzTimeMs: charIdx * CHAR_INTERVAL_MS,
        answerTimeMs: 2000,
        isCorrect: true,
        normalizedAnswer: q.answers[0].toLowerCase().replace(/\s+/g, ""),
      });
    }
  }

  console.log(`완료! 문제 ${SEED_QUESTIONS.length}개, 고스트 ${SEED_QUESTIONS.length * 3}개 삽입.`);
}

seed().catch(console.error);
