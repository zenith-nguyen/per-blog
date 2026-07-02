"use client";

import { useState } from "react";
import type { Comment } from "@/lib/types";
import { formatDate } from "./PostCard";

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: number;
  initialComments: Comment[];
}) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, author_name: author, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Có lỗi xảy ra.");
      setState("sent");
      setAuthor("");
      setContent("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    }
  }

  return (
    <section className="mt-16 border-t-2 border-ink/80 pt-8 dark:border-cream/60">
      <h2 className="font-display text-2xl font-semibold text-ink dark:text-paper">
        Bình luận{" "}
        <span className="font-mono text-base text-vermilion">({initialComments.length})</span>
      </h2>

      <div className="mt-6 space-y-6">
        {initialComments.length === 0 && (
          <p className="text-sm text-ink-faint italic dark:text-cream-faint">
            Chưa có bình luận nào — hãy là người đầu tiên.
          </p>
        )}
        {initialComments.map((c) => (
          <div key={c.id} className="border-l-2 border-vermilion/40 pl-4">
            <p className="text-sm font-semibold text-ink dark:text-paper">
              {c.author_name}
              <span className="ml-3 text-xs font-normal text-ink-faint dark:text-cream-faint">
                {formatDate(c.created_at)}
              </span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft dark:text-cream-faint">
              {c.content}
            </p>
          </div>
        ))}
      </div>

      {state === "sent" ? (
        <p className="mt-8 border border-vermilion/40 bg-vermilion/5 p-4 text-sm text-vermilion-deep dark:text-vermilion">
          Cảm ơn bạn! Bình luận sẽ hiển thị sau khi được duyệt.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="c-name" className="mb-1 block text-xs tracking-[0.14em] uppercase text-ink-faint dark:text-cream-faint">
              Tên của bạn
            </label>
            <input
              id="c-name"
              required
              maxLength={80}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full border border-ink/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-vermilion dark:border-cream/20"
            />
          </div>
          <div>
            <label htmlFor="c-content" className="mb-1 block text-xs tracking-[0.14em] uppercase text-ink-faint dark:text-cream-faint">
              Nội dung
            </label>
            <textarea
              id="c-content"
              required
              rows={4}
              maxLength={2000}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-y border border-ink/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-vermilion dark:border-cream/20"
            />
          </div>
          {error && <p className="text-sm text-vermilion">{error}</p>}
          <button
            type="submit"
            disabled={state === "sending"}
            className="bg-ink px-6 py-2.5 text-sm font-medium tracking-wide text-paper transition-colors hover:bg-vermilion disabled:opacity-50 dark:bg-paper dark:text-ink dark:hover:bg-vermilion dark:hover:text-paper"
          >
            {state === "sending" ? "Đang gửi…" : "Gửi bình luận"}
          </button>
        </form>
      )}
    </section>
  );
}
