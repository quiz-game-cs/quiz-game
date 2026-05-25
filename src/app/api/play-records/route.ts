import { NextResponse } from "next/server";
import { db } from "@/db";
import { playRecords } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      questionId,
      userName,
      buzzTimeMs,
      buzzCharIndex,
      answerTimeMs,
      isCorrect,
      normalizedAnswer,
    } = body;

    if (!questionId) {
      return NextResponse.json({ error: "questionId는 필수입니다" }, { status: 400 });
    }

    const [record] = await db
      .insert(playRecords)
      .values({
        questionId,
        userName: userName || "익명",
        buzzTimeMs: buzzTimeMs ?? null,
        buzzCharIndex: buzzCharIndex ?? null,
        answerTimeMs: answerTimeMs ?? null,
        isCorrect: isCorrect ?? false,
        normalizedAnswer: normalizedAnswer ?? "",
      })
      .returning();

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("플레이 기록 저장 실패:", error);
    return NextResponse.json({ error: "플레이 기록 저장에 실패했습니다" }, { status: 500 });
  }
}
