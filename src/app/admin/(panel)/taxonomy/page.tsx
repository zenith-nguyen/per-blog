"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, Tag } from "@/lib/types";

export default function TaxonomyPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [c, t] = await Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/tags").then((r) => r.json()),
    ]);
    setCategories(c.categories ?? []);
    setTags(t.tags ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName, description: catDesc }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message ?? "Lỗi.");
    setCatName("");
    setCatDesc("");
    load();
  }

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tagName }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message ?? "Lỗi.");
    setTagName("");
    load();
  }

  async function removeCategory(c: Category) {
    if (!confirm(`Xoá chuyên mục "${c.name}"?\nBài viết trong chuyên mục sẽ chuyển thành "Chưa phân loại".`)) return;
    await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    load();
  }

  async function removeTag(t: Tag) {
    if (!confirm(`Xoá thẻ "#${t.slug}"?`)) return;
    await fetch(`/api/admin/tags/${t.id}`, { method: "DELETE" });
    load();
  }

  const inputCls =
    "w-full border border-ink/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent dark:border-cream/20";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 font-display text-4xl font-semibold text-ink dark:text-paper">
        Chuyên mục & Thẻ
      </h1>
      <p className="mb-8 text-sm text-ink-faint dark:text-cream-faint">
        Chuyên mục là cấu trúc chính (mỗi bài một chuyên mục). Thẻ dùng để gắn nhãn tự do (nhiều thẻ mỗi bài).
      </p>

      {error && <p className="mb-6 border border-accent/40 bg-accent/5 p-3 text-sm text-accent">{error}</p>}

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-ink dark:text-paper">Chuyên mục</h2>
          <form onSubmit={addCategory} className="mb-5 space-y-2 border border-ink/15 bg-paper-warm p-4 dark:border-cream/15 dark:bg-night-soft">
            <input
              required
              placeholder="Tên chuyên mục mới…"
              aria-label="Tên chuyên mục mới"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className={inputCls}
            />
            <input
              placeholder="Mô tả (tuỳ chọn)"
              aria-label="Mô tả chuyên mục"
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              className={inputCls}
            />
            <button className="bg-ink px-4 py-2 text-xs font-medium text-paper transition-colors hover:bg-accent dark:bg-paper dark:text-ink dark:hover:bg-accent dark:hover:text-paper">
              + Thêm chuyên mục
            </button>
          </form>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between border-b border-ink/10 py-2.5 text-sm dark:border-cream/10">
                <div>
                  <span className="font-medium text-ink dark:text-paper">{c.name}</span>
                  <span className="ml-2 font-mono text-xs text-ink-faint dark:text-cream-faint">
                    /{c.slug} · {c.post_count} bài
                  </span>
                </div>
                <button onClick={() => removeCategory(c)} className="link-sweep text-xs text-ink-faint hover:text-accent dark:text-cream-faint">
                  Xoá
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-ink dark:text-paper">Thẻ</h2>
          <form onSubmit={addTag} className="mb-5 flex gap-2 border border-ink/15 bg-paper-warm p-4 dark:border-cream/15 dark:bg-night-soft">
            <input
              required
              placeholder="Tên thẻ mới…"
              aria-label="Tên thẻ mới"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className={inputCls}
            />
            <button className="shrink-0 bg-ink px-4 py-2 text-xs font-medium text-paper transition-colors hover:bg-accent dark:bg-paper dark:text-ink dark:hover:bg-accent dark:hover:text-paper">
              + Thêm
            </button>
          </form>
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t.id} className="group flex items-center gap-2 border border-ink/20 px-3 py-1.5 font-mono text-xs dark:border-cream/20">
                <span className="text-ink-soft dark:text-cream-faint">
                  #{t.slug} <span className="text-ink-faint dark:text-cream-faint">({t.post_count})</span>
                </span>
                <button
                  onClick={() => removeTag(t)}
                  aria-label={`Xoá thẻ ${t.name}`}
                  className="text-ink-faint transition-colors hover:text-accent dark:text-cream-faint"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
