import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const ROUNDS = 10;

export async function GET(request: NextRequest) {
  try {
    const opponentId = request.nextUrl.searchParams.get("opponentId");
    const authorNickname = request.nextUrl.searchParams.get("authorNickname");
    if (!opponentId) {
      return NextResponse.json(
        { error: "opponentId가 필요합니다" },
        { status: 400 }
      );
    }

    const [opponent] = await db
      .select({ id: users.id, nickname: users.nickname })
      .from(users)
      .where(eq(users.id, opponentId))
      .limit(1);

    if (!opponent) {
      return NextResponse.json(
        { error: "상대를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Pick `ROUNDS` random questions for which the opponent has at least one
    // play record. For each, attach the opponent's most recent record.
    const rounds = await db.execute(sql`
      WITH opp_latest AS (
        SELECT DISTINCT ON (p.question_id)
          p.question_id,
          p.buzz_time_ms,
          p.buzz_char_index,
          p.answer_time_ms,
          p.is_correct,
          p.normalized_answer
        FROM play_records p
        WHERE p.user_id = ${opponentId}
        ORDER BY p.question_id, p.created_at DESC
      )
      SELECT
        q.id AS "questionId",
        q.text AS "questionText",
        q.answers AS "questionAnswers",
        q.category_id AS "categoryId",
        q.difficulty AS "questionDifficulty",
        opp_latest.buzz_time_ms AS "oppBuzzTimeMs",
        opp_latest.buzz_char_index AS "oppBuzzCharIndex",
        opp_latest.answer_time_ms AS "oppAnswerTimeMs",
        opp_latest.is_correct AS "oppIsCorrect",
        opp_latest.normalized_answer AS "oppNormalizedAnswer"
      FROM opp_latest
      JOIN questions q ON q.id = opp_latest.question_id
      ${
        authorNickname
          ? sql`JOIN users author ON author.id = q.author_id`
          : sql``
      }
      WHERE q.status = 'approved'
      ${authorNickname ? sql`AND author.nickname = ${authorNickname}` : sql``}
      ORDER BY random()
      LIMIT ${ROUNDS}
    `);

    const rows = (rounds.rows ?? rounds) as Array<{
      questionId: string;
      questionText: string;
      questionAnswers: string[];
      categoryId: string | null;
      questionDifficulty: number | null;
      oppBuzzTimeMs: number | null;
      oppBuzzCharIndex: number | null;
      oppAnswerTimeMs: number | null;
      oppIsCorrect: boolean | null;
      oppNormalizedAnswer: string | null;
    }>;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "상대의 풀이 기록이 부족합니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      opponent: { id: opponent.id, nickname: opponent.nickname },
      rounds: rows.map((r) => ({
        question: {
          id: r.questionId,
          text: r.questionText,
          answers: r.questionAnswers,
          categoryId: r.categoryId,
          difficulty: r.questionDifficulty,
        },
        opponentRecord: {
          buzzTimeMs: r.oppBuzzTimeMs,
          buzzCharIndex: r.oppBuzzCharIndex,
          answerTimeMs: r.oppAnswerTimeMs,
          isCorrect: r.oppIsCorrect ?? false,
          normalizedAnswer: r.oppNormalizedAnswer,
        },
      })),
    });
  } catch (error) {
    console.error("ghost-battle setup 실패:", error);
    return NextResponse.json(
      { error: "매치 준비에 실패했습니다" },
      { status: 500 }
    );
  }
}
