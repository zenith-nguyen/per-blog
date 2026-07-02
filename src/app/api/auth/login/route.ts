import { NextRequest, NextResponse } from "next/server";
import { login, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = String(body?.username ?? "");
  const password = String(body?.password ?? "");
  if (!username || !password) {
    return NextResponse.json(
      { error: "VALIDATION", message: "Thiếu tên đăng nhập hoặc mật khẩu." },
      { status: 400 }
    );
  }
  const token = await login(username, password);
  if (!token) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS", message: "Sai tên đăng nhập hoặc mật khẩu." },
      { status: 401 }
    );
  }
  const res = NextResponse.json({ ok: true });
  const { name, ...opts } = sessionCookieOptions();
  res.cookies.set(name, token, opts);
  return res;
}
