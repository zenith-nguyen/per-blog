import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createPost, listPosts, slugExists } from "@/lib/repo";
import { parsePostInput } from "@/lib/validate";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const sp = req.nextUrl.searchParams;
  const result = listPosts({
    status: (sp.get("status") as "draft" | "published" | "all") ?? "all",
    search: sp.get("search") ?? undefined,
    page: Number(sp.get("page") ?? 1),
    perPage: Number(sp.get("per_page") ?? 20),
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const body = await req.json().catch(() => ({}));
  const input = parsePostInput(body);
  if ("message" in input) {
    return NextResponse.json({ error: "VALIDATION", ...input }, { status: 400 });
  }
  if (slugExists(input.slug)) {
    return NextResponse.json(
      { error: "CONFLICT", message: `Slug "${input.slug}" đã tồn tại.` },
      { status: 409 }
    );
  }
  const post = createPost(input);
  return NextResponse.json({ post }, { status: 201 });
}
