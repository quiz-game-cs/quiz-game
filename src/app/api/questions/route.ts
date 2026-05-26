import { NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, answers, categoryId, difficulty } = body;

    if (!text || !answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "text와 answers(배열)는 필수입니다" },
        { status: 400 }
      );
    }

    const [question] = await db
      .insert(questions)
      .values({
        text,
        answers,
        categoryId: categoryId ?? null,
        difficulty: difficulty ?? 1,
      })
      .returning();

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("문제 등록 실패:", error);
    return NextResponse.json({ error: "문제 등록에 실패했습니다" }, { status: 500 });
  }
}
