"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";

const FIELDS: { key: keyof SiteSettings; label: string; kind: "input" | "textarea" }[] = [
  { key: "site_title", label: "Tên blog", kind: "input" },
  { key: "site_tagline", label: "Khẩu hiệu (tagline)", kind: "input" },
  { key: "site_description", label: "Mô tả (SEO & trang chủ)", kind: "textarea" },
  { key: "author_name", label: "Tên tác giả", kind: "input" },
  { key: "author_bio", label: "Giới thiệu tác giả", kind: "textarea" },
  { key: "social_github", label: "GitHub URL", kind: "input" },
  { key: "social_twitter", label: "Twitter/X URL", kind: "input" },
  { key: "social_email", label: "Email liên hệ", kind: "input" },
  { key: "posts_per_page", label: "Số bài mỗi trang (danh sách)", kind: "input" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setState("saving");
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setState("saved");
    setTimeout(() => setState("idle"), 2500);
  }

  if (!settings) {
    return <p className="py-16 text-center text-sm text-ink-faint dark:text-cream-faint">Đang tải…</p>;
  }

  const inputCls =
    "w-full border border-ink/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent dark:border-cream/20";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 font-display text-4xl font-semibold text-ink dark:text-paper">Cài đặt</h1>
      <p className="mb-8 text-sm text-ink-faint dark:text-cream-faint">
        Thông tin hiển thị trên toàn bộ blog. Thay đổi có hiệu lực ngay khi lưu.
      </p>

      <form onSubmit={save} className="space-y-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="mb-1.5 block text-xs tracking-[0.14em] uppercase text-ink-faint dark:text-cream-faint">
              {f.label}
            </label>
            {f.kind === "textarea" ? (
              <textarea
                id={f.key}
                rows={3}
                value={settings[f.key]}
                onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                className={`${inputCls} resize-y`}
              />
            ) : (
              <input
                id={f.key}
                value={settings[f.key]}
                onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                className={inputCls}
              />
            )}
          </div>
        ))}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={state === "saving"}
            className="bg-accent px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent-deep disabled:opacity-50"
          >
            {state === "saving" ? "Đang lưu…" : "Lưu cài đặt"}
          </button>
          {state === "saved" && <span className="text-sm text-accent">✓ Đã lưu</span>}
        </div>
      </form>
    </div>
  );
}
