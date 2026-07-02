"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Comment } from "@/lib/types";

const FILTERS = [
  ["all", "Tất cả"],
  ["pending", "Chờ duyệt"],
  ["approved", "Đã duyệt"],
  ["spam", "Spam"],
] as const;

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/comments?status=${filter}`);
    const data = await res.json();
    setComments(data.comments ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: number, status: "approved" | "pending" | "spam") {
    await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function remove(id: number) {
    if (!confirm("Xoá vĩnh viễn bình luận này?")) return;
    await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 font-display text-4xl font-semibold text-ink dark:text-paper">Bình luận</h1>
      <p className="mb-8 text-sm text-ink-faint dark:text-cream-faint">
        Bình luận mới luôn ở trạng thái “Chờ duyệt” và chỉ hiển thị công khai sau khi bạn duyệt.
      </p>

      <div className="mb-6 flex text-xs">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`border px-4 py-2 transition-colors ${
              filter === value
                ? "border-accent bg-accent text-paper"
                : "border-ink/20 text-ink-soft hover:border-accent dark:border-cream/20 dark:text-cream-faint"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-faint dark:text-cream-faint">Đang tải…</p>
      ) : comments.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-faint dark:text-cream-faint">
          Không có bình luận nào.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="border border-ink/15 bg-paper-warm p-5 dark:border-cream/15 dark:bg-night-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink dark:text-paper">
                  {c.author_name}
                  <span className="ml-3 text-xs font-normal text-ink-faint dark:text-cream-faint">
                    {new Date(c.created_at.replace(" ", "T")).toLocaleString("vi-VN")}
                  </span>
                </p>
                <span
                  className={`px-2 py-0.5 font-mono text-[11px] ${
                    c.status === "pending"
                      ? "bg-accent/15 text-accent"
                      : c.status === "approved"
                        ? "bg-ink/10 text-ink-soft dark:bg-cream/10 dark:text-cream-faint"
                        : "bg-ink/20 text-ink-faint line-through dark:bg-cream/5 dark:text-cream-faint"
                  }`}
                >
                  {c.status === "pending" ? "Chờ duyệt" : c.status === "approved" ? "Đã duyệt" : "Spam"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-cream-faint">{c.content}</p>
              <p className="mt-2 text-xs text-ink-faint dark:text-cream-faint">
                trên{" "}
                <Link href={`/blog/${c.post_slug}`} target="_blank" className="link-sweep text-accent">
                  {c.post_title}
                </Link>
              </p>
              <div className="mt-3 flex gap-3 border-t border-ink/10 pt-3 text-xs dark:border-cream/10">
                {c.status !== "approved" && (
                  <button onClick={() => setStatus(c.id, "approved")} className="link-sweep text-accent">
                    ✓ Duyệt
                  </button>
                )}
                {c.status !== "pending" && (
                  <button onClick={() => setStatus(c.id, "pending")} className="link-sweep text-ink-soft dark:text-cream-faint">
                    ⏸ Chờ duyệt
                  </button>
                )}
                {c.status !== "spam" && (
                  <button onClick={() => setStatus(c.id, "spam")} className="link-sweep text-ink-faint dark:text-cream-faint">
                    ⚠ Spam
                  </button>
                )}
                <button onClick={() => remove(c.id)} className="link-sweep ml-auto text-ink-faint hover:text-accent dark:text-cream-faint">
                  Xoá vĩnh viễn
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
