import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteCategory } from "@/lib/repo";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const { id } = await params;
  const ok = deleteCategory(Number(id));
  if (!ok) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Không tìm thấy chuyên mục." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
