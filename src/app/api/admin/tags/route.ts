import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createTag, listTags } from "@/lib/repo";
import { slugify } from "@/lib/markdown";

export async function GET() {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  return NextResponse.json({ tags: listTags() });
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
    return NextResponse.json({ error: "VALIDATION", message: "Tên thẻ trống." }, { status: 400 });
  }
  try {
    const tag = createTag(name, slugify(name));
    return NextResponse.json({ tag }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "CONFLICT", message: "Thẻ đã tồn tại." }, { status: 409 });
  }
}
