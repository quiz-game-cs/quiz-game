import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("카테고리 조회 실패:", error);
    return NextResponse.json({ error: "카테고리 조회에 실패했습니다" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, displayOrder } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "카테고리 이름이 필요합니다" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(categories)
      .values({ name: name.trim(), displayOrder: displayOrder ?? 0 })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error("카테고리 등록 실패:", error);
    return NextResponse.json({ error: "카테고리 등록에 실패했습니다" }, { status: 500 });
  }
}
