import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { listAllComments } from "@/lib/repo";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const status = req.nextUrl.searchParams.get("status") ?? "all";
  return NextResponse.json({ comments: listAllComments(status) });
}
