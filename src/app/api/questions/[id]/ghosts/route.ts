import { NextResponse } from "next/server";
import { db } from "@/db";
import { playRecords, questions } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { generateSeedGhosts } from "@/lib/ghost";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const correctRecords = await db
      .select()
      .from(playRecords)
      .where(and(eq(playRecords.questionId, id), eq(playRecords.isCorrect, true)))
      .orderBy(asc(playRecords.buzzCharIndex))
      .limit(3);

    if (correctRecords.length >= 3) {
      return NextResponse.json({
        ghosts: correctRecords.map((r) => ({
          userName: r.userName ?? "익명",
          buzzTimeMs: r.buzzTimeMs ?? 0,
          buzzCharIndex: r.buzzCharIndex ?? 0,
          isCorrect: r.isCorrect ?? false,
        })),
      });
    }

    const allRecords = await db
      .select()
      .from(playRecords)
      .where(eq(playRecords.questionId, id))
      .orderBy(asc(playRecords.buzzCharIndex))
      .limit(3);

    if (allRecords.length >= 3) {
      return NextResponse.json({
        ghosts: allRecords.map((r) => ({
          userName: r.userName ?? "익명",
          buzzTimeMs: r.buzzTimeMs ?? 0,
          buzzCharIndex: r.buzzCharIndex ?? 0,
          isCorrect: r.isCorrect ?? false,
        })),
      });
    }

    const question = await db
      .select()
      .from(questions)
      .where(eq(questions.id, id))
      .limit(1);

    if (question.length === 0) {
      return NextResponse.json({ error: "문제를 찾을 수 없습니다" }, { status: 404 });
    }

    const existing = allRecords.map((r) => ({
      userName: r.userName ?? "익명",
      buzzTimeMs: r.buzzTimeMs ?? 0,
      buzzCharIndex: r.buzzCharIndex ?? 0,
      isCorrect: r.isCorrect ?? false,
    }));

    const seeds = generateSeedGhosts(question[0].text, question[0].answers);
    const ghosts = [...existing, ...seeds].slice(0, 3);

    return NextResponse.json({ ghosts });
  } catch (error) {
    console.error("고스트 조회 실패:", error);
    return NextResponse.json({ error: "고스트 조회에 실패했습니다" }, { status: 500 });
  }
}
