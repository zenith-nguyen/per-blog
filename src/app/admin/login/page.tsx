"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Đăng nhập thất bại.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="rise w-full max-w-sm">
        <p className="text-center font-mono text-xs tracking-[0.3em] text-accent uppercase">
          Khu vực quản trị
        </p>
        <h1 className="mt-3 text-center font-display text-4xl font-semibold text-ink dark:text-paper">
          Mực & Giấy<span className="text-accent">.</span>
        </h1>

        <form
          onSubmit={submit}
          className="mt-10 space-y-5 border border-ink/15 bg-paper-warm p-8 dark:border-cream/15 dark:bg-night-soft"
        >
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs tracking-[0.14em] uppercase text-ink-faint dark:text-cream-faint">
              Email đăng nhập
            </label>
            <input
              id="username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-ink/20 bg-paper px-3 py-2.5 text-sm outline-none focus:border-accent dark:border-cream/20 dark:bg-night"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs tracking-[0.14em] uppercase text-ink-faint dark:text-cream-faint">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-ink/20 bg-paper px-3 py-2.5 text-sm outline-none focus:border-accent dark:border-cream/20 dark:bg-night"
            />
          </div>
          {error && <p className="text-sm text-accent">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-ink py-3 text-sm font-medium tracking-wide text-paper transition-colors hover:bg-accent disabled:opacity-50 dark:bg-paper dark:text-ink dark:hover:bg-accent dark:hover:text-paper"
          >
            {busy ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
