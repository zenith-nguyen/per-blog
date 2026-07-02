import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/repo";
import type { SiteSettings } from "@/lib/types";

const ALLOWED_KEYS: (keyof SiteSettings)[] = [
  "site_title",
  "site_tagline",
  "site_description",
  "author_name",
  "author_bio",
  "social_github",
  "social_twitter",
  "social_email",
  "posts_per_page",
];

export async function GET() {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  return NextResponse.json({ settings: getSettings() });
}

export async function PUT(req: NextRequest) {
  try {
    await requireAuth();
  } catch (r) {
    return r as Response;
  }
  const body = await req.json().catch(() => ({}));
  const values: Partial<SiteSettings> = {};
  for (const key of ALLOWED_KEYS) {
    if (typeof body?.[key] === "string") values[key] = body[key];
  }
  return NextResponse.json({ settings: updateSettings(values) });
}
