"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import type { Category, Post, Tag } from "@/lib/types";

// Client-side mirror of lib/markdown.slugify (that module imports server-only code).
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface Props {
  post?: Post; // undefined = create mode
}

export default function PostEditor({ post }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [categoryId, setCategoryId] = useState<number | "">(post?.category_id ?? "");
  const [tagIds, setTagIds] = useState<number[]>(post?.tags?.map((t) => t.id) ?? []);
  const [featured, setFeatured] = useState(!!post?.featured);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/tags").then((r) => r.json()),
    ]).then(([c, t]) => {
      setCategories(c.categories ?? []);
      setTags(t.tags ?? []);
    });
  }, []);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const previewHtml = useMemo(
    () => (tab === "preview" ? (marked.parse(content, { gfm: true, breaks: true }) as string) : ""),
    [tab, content]
  );
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  async function save(status: "draft" | "published") {
    setBusy(true);
    setError("");
    const payload = {
      title,
      slug,
      excerpt,
      content,
      cover_image: coverImage || null,
      status,
      featured,
      category_id: categoryId || null,
      tag_ids: tagIds,
    };
    try {
      const res = await fetch(post ? `/api/admin/posts/${post.id}` : "/api/admin/posts", {
        method: post ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Lưu thất bại.");
      router.push("/admin/posts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu thất bại.");
      setBusy(false);
    }
  }

  function toggleTag(id: number) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  const inputCls =
    "w-full border border-ink/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-accent dark:border-cream/20";
  const labelCls =
    "mb-1.5 block text-xs tracking-[0.14em] uppercase text-ink-faint dark:text-cream-faint";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-5">
        <div>
          <label htmlFor="p-title" className={labelCls}>Tiêu đề</label>
          <input
            id="p-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề bài viết…"
            className={`${inputCls} font-display text-xl font-semibold`}
          />
        </div>

        <div>
          <label htmlFor="p-slug" className={labelCls}>Slug (đường dẫn)</label>
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-ink-faint dark:text-cream-faint">/blog/</span>
            <input
              id="p-slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value) || e.target.value);
              }}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="p-excerpt" className={labelCls}>Mô tả ngắn (hiển thị ở danh sách & SEO)</label>
          <textarea
            id="p-excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className={`${inputCls} resize-y`}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex text-xs">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={`border px-4 py-2 ${tab === "write" ? "border-accent bg-accent text-paper" : "border-ink/20 dark:border-cream/20"}`}
              >
                ✎ Viết (Markdown)
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`border px-4 py-2 ${tab === "preview" ? "border-accent bg-accent text-paper" : "border-ink/20 dark:border-cream/20"}`}
              >
                ◫ Xem trước
              </button>
            </div>
            <span className="font-mono text-xs text-ink-faint dark:text-cream-faint">
              {wordCount.toLocaleString("vi-VN")} từ · ~{Math.max(1, Math.round(wordCount / 200))} phút đọc
            </span>
          </div>
          {tab === "write" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={22}
              aria-label="Nội dung bài viết dạng Markdown"
              placeholder={"Viết bằng Markdown…\n\n## Tiêu đề mục\n\nĐoạn văn với **chữ đậm**, *nghiêng*, `code`…"}
              className={`${inputCls} slim-scroll resize-y font-mono text-[13px] leading-relaxed`}
            />
          ) : (
            <div
              className="prose-ink slim-scroll min-h-[300px] max-h-[600px] overflow-y-auto border border-ink/20 p-6 dark:border-cream/20"
              // Preview of the admin's own markdown — trusted content.
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          )}
        </div>

        {error && <p className="border border-accent/40 bg-accent/5 p-3 text-sm text-accent">{error}</p>}
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        <div className="border border-ink/15 bg-paper-warm p-5 dark:border-cream/15 dark:bg-night-soft">
          <p className={labelCls}>Xuất bản</p>
          <div className="space-y-2">
            <button
              onClick={() => save("published")}
              disabled={busy}
              className="w-full bg-accent py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent-deep disabled:opacity-50"
            >
              {busy ? "Đang lưu…" : post?.status === "published" ? "Cập nhật" : "Đăng bài"}
            </button>
            <button
              onClick={() => save("draft")}
              disabled={busy}
              className="w-full border border-ink/25 py-2.5 text-sm transition-colors hover:border-accent disabled:opacity-50 dark:border-cream/25"
            >
              Lưu nháp
            </button>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-accent"
            />
            Đánh dấu nổi bật
          </label>
        </div>

        <div className="border border-ink/15 bg-paper-warm p-5 dark:border-cream/15 dark:bg-night-soft">
          <label htmlFor="p-cat" className={labelCls}>Chuyên mục</label>
          <select
            id="p-cat"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
            className={`${inputCls} bg-paper-warm dark:bg-night-soft`}
          >
            <option value="">— Chưa phân loại —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <p className={`${labelCls} mt-5`}>Thẻ</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`border px-2.5 py-1 font-mono text-xs transition-colors ${
                  tagIds.includes(t.id)
                    ? "border-accent bg-accent text-paper"
                    : "border-ink/20 text-ink-soft hover:border-accent dark:border-cream/20 dark:text-cream-faint"
                }`}
              >
                #{t.slug}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-ink/15 bg-paper-warm p-5 dark:border-cream/15 dark:bg-night-soft">
          <label htmlFor="p-cover" className={labelCls}>Ảnh bìa (URL, tuỳ chọn)</label>
          <input
            id="p-cover"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://…"
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
      </aside>
    </div>
  );
}
