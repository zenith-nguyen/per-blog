import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deletePost, getPostById, slugExists, updatePost } from "@/lib/repo";
import { parsePostInput } from "@/lib/validate";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const { id } = await params;
  const post = getPostById(Number(id));
  if (!post) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Không tìm thấy bài viết." }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const input = parsePostInput(body);
  if ("message" in input) {
    return NextResponse.json({ error: "VALIDATION", ...input }, { status: 400 });
  }
  if (slugExists(input.slug, Number(id))) {
    return NextResponse.json(
      { error: "CONFLICT", message: `Slug "${input.slug}" đã tồn tại.` },
      { status: 409 }
    );
  }
  const post = updatePost(Number(id), input);
  if (!post) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Không tìm thấy bài viết." }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const { id } = await params;
  const ok = deletePost(Number(id));
  if (!ok) {
    return NextResponse.json({ error: "NOT_FOUND", message: "Không tìm thấy bài viết." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
