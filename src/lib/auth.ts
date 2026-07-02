import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { getDb, verifyPassword } from "./db";

const SESSION_COOKIE = "blog_session";
const SESSION_DAYS = 7;

export interface SessionUser {
  id: number;
  username: string;
  display_name: string;
}

export async function login(username: string, password: string): Promise<string | null> {
  const db = getDb();
  const user = db
    .prepare("SELECT id, password_hash FROM users WHERE username = ?")
    .get(username) as { id: number; password_hash: string } | undefined;
  if (!user || !verifyPassword(password, user.password_hash)) return null;

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(
    token,
    user.id,
    expires.toISOString()
  );
  // Opportunistic cleanup of expired sessions.
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(new Date().toISOString());
  return token;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.username, u.display_name FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`
    )
    .get(token, new Date().toISOString()) as SessionUser | undefined;
  return row ?? null;
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  };
}

/** Guard for admin API routes — returns the user or throws a 401 Response. */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw Response.json(
      { error: "UNAUTHORIZED", message: "Bạn cần đăng nhập để thực hiện thao tác này." },
      { status: 401 }
    );
  }
  return user;
}
