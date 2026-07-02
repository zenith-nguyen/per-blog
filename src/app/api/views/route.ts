import { NextRequest, NextResponse } from "next/server";
import { recordView } from "@/lib/repo";

// Public endpoint — the ViewTracker client component calls this once per
// browser session per post (deduped with sessionStorage).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const slug = String(body?.slug ?? "");
  if (!slug) {
    return NextResponse.json({ error: "VALIDATION", message: "Thiếu slug." }, { status: 400 });
  }
  recordView(slug);
  return NextResponse.json({ ok: true });
}
