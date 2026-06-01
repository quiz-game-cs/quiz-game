import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const excludeUserId = request.nextUrl.searchParams.get("excludeUserId");
    const authorNickname = request.nextUrl.searchParams.get("authorNickname");

    const whereParts = [];
    if (excludeUserId) whereParts.push(sql`u.id <> ${excludeUserId}`);
    if (authorNickname) whereParts.push(sql`author.nickname = ${authorNickname}`);
    const whereClause = whereParts.length
      ? sql`WHERE ${sql.join(whereParts, sql` AND `)}`
      : sql``;

    const rows = await db.execute(sql`
      SELECT
        u.id,
        u.nickname,
        COUNT(p.id)::int AS "totalPlays",
        SUM(CASE WHEN p.is_correct THEN 1 ELSE 0 END)::int AS "correctCount"
      FROM users u
      JOIN play_records p ON p.user_id = u.id
      ${
        authorNickname
          ? sql`JOIN questions q ON q.id = p.question_id JOIN users author ON author.id = q.author_id`
          : sql``
      }
      ${whereClause}
      GROUP BY u.id, u.nickname
      HAVING COUNT(p.id) >= 10
      ORDER BY COUNT(p.id) DESC
    `);

    const opponents = ((rows.rows ?? rows) as Array<{
      id: string;
      nickname: string;
      totalPlays: number;
      correctCount: number;
    }>).map((r) => ({
      id: r.id,
      nickname: r.nickname,
      totalPlays: r.totalPlays,
      correctCount: r.correctCount,
      accuracy: r.totalPlays > 0 ? r.correctCount / r.totalPlays : 0,
    }));

    return NextResponse.json({ opponents });
  } catch (error) {
    console.error("상대 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "상대 목록 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
