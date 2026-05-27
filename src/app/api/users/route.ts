import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawNickname = typeof body?.nickname === "string" ? body.nickname.trim() : "";

    if (!rawNickname) {
      return NextResponse.json({ error: "nickname은 필수입니다" }, { status: 400 });
    }

    await db
      .insert(users)
      .values({ nickname: rawNickname })
      .onConflictDoNothing({ target: users.nickname });

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.nickname, rawNickname))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "user 조회에 실패했습니다" }, { status: 500 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("user switch-or-create 실패:", error);
    return NextResponse.json({ error: "user 처리에 실패했습니다" }, { status: 500 });
  }
}
