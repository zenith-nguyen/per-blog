import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/repo";

export async function GET() {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  return NextResponse.json({ stats: getDashboardStats() });
}
