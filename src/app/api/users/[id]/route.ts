import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "user를 찾을 수 없습니다" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("user 조회 실패:", error);
    return NextResponse.json({ error: "user 조회에 실패했습니다" }, { status: 500 });
  }
}
