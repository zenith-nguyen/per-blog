import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createCategory, listCategories } from "@/lib/repo";
import { slugify } from "@/lib/markdown";

export async function GET() {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  return NextResponse.json({ categories: listCategories() });
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "VALIDATION", message: "Tên chuyên mục trống." }, { status: 400 });
  }
  try {
    const category = createCategory(name, slugify(name), String(body?.description ?? "").trim());
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "CONFLICT", message: "Chuyên mục đã tồn tại." }, { status: 409 });
  }
}
