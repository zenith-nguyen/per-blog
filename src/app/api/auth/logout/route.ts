import { NextResponse } from "next/server";
import { logout, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  await logout();
  const res = NextResponse.json({ ok: true });
  const { name, ...opts } = sessionCookieOptions();
  res.cookies.set(name, "", { ...opts, maxAge: 0 });
  return res;
}
