import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteComment, setCommentStatus } from "@/lib/repo";

type Params = { params: Promise<{ id: string }> };

// PATCH { status: "approved" | "pending" | "spam" }
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = String(body?.status ?? "");
  if (!["approved", "pending", "spam"].includes(status)) {
    return NextResponse.json({ error: "VALIDATION", message: "Trạng thái không hợp lệ." }, { status: 400 });
  }
  const ok = setCommentStatus(Number(id), status as "approved" | "pending" | "spam");
  if (!ok) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Không tìm thấy bình luận." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const { id } = await params;
  const ok = deleteComment(Number(id));
  if (!ok) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Không tìm thấy bình luận." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
