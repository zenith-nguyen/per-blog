import { NextRequest, NextResponse } from "next/server";
import { createComment } from "@/lib/repo";
import { getDb } from "@/lib/db";

// Public endpoint — visitors submit comments; they enter moderation as 'pending'.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const postId = Number(body?.post_id);
  const author = String(body?.author_name ?? "").trim().slice(0, 80);
  const content = String(body?.content ?? "").trim().slice(0, 2000);

  if (!postId || !author || !content) {
    return NextResponse.json(
      { error: "VALIDATION", message: "Vui lòng nhập tên và nội dung bình luận." },
      { status: 400 }
    );
  }
  const post = getDb()
    .prepare("SELECT 1 FROM posts WHERE id = ? AND status = 'published'")
    .get(postId);
  if (!post) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "Bài viết không tồn tại." },
      { status: 404 }
    );
  }
  const comment = createComment(postId, author, content);
  return NextResponse.json({ ok: true, comment }, { status: 201 });
}
