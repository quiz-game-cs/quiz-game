import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { questions, categories, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const count = Math.min(
      Number(request.nextUrl.searchParams.get("count") ?? "1"),
      20
    );
    const authorNickname = request.nextUrl.searchParams.get("authorNickname");

    const selectFields = {
      id: questions.id,
      text: questions.text,
      answers: questions.answers,
      categoryId: questions.categoryId,
      categoryName: categories.minorName,
      difficulty: questions.difficulty,
      status: questions.status,
    };

    const rows = authorNickname
      ? await db
          .select(selectFields)
          .from(questions)
          .leftJoin(categories, eq(questions.categoryId, categories.id))
          .innerJoin(users, eq(questions.authorId, users.id))
          .where(
            and(
              eq(questions.status, "approved"),
              eq(users.nickname, authorNickname)
            )
          )
          .orderBy(sql`random()`)
          .limit(count)
      : await db
          .select(selectFields)
          .from(questions)
          .leftJoin(categories, eq(questions.categoryId, categories.id))
          .where(eq(questions.status, "approved"))
          .orderBy(sql`random()`)
          .limit(count);

    if (rows.length === 0) {
      return NextResponse.json({ error: "문제가 없습니다" }, { status: 404 });
    }

    return NextResponse.json(count === 1 ? rows[0] : rows);
  } catch (error) {
    console.error("문제 조회 실패:", error);
    return NextResponse.json({ error: "문제 조회에 실패했습니다" }, { status: 500 });
  }
}
