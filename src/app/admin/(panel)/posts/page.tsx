"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Post } from "@/lib/types";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status, per_page: "100" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0); // debounce typing
    return () => clearTimeout(t);
  }, [load, search]);

  async function remove(post: Post) {
    if (!confirm(`Xoá vĩnh viễn bài "${post.title}"?\nHành động này không thể hoàn tác.`)) return;
    const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) setPosts((p) => p.filter((x) => x.id !== post.id));
    else alert("Xoá thất bại.");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink dark:text-paper">Bài viết</h1>
          <p className="mt-1 text-sm text-ink-faint dark:text-cream-faint">
            Quản lý toàn bộ bài viết — bao gồm cả bản nháp.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-accent px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent-deep"
        >
          + Viết bài mới
        </Link>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Tìm bài viết…"
          aria-label="Tìm bài viết"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 border border-ink/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent dark:border-cream/20"
        />
        <div className="flex text-xs">
          {(
            [
              ["all", "Tất cả"],
              ["published", "Đã đăng"],
              ["draft", "Nháp"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={`border px-4 py-2 transition-colors ${
                status === value
                  ? "border-accent bg-accent text-paper"
                  : "border-ink/20 text-ink-soft hover:border-accent dark:border-cream/20 dark:text-cream-faint"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-faint dark:text-cream-faint">Đang tải…</p>
      ) : posts.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-faint dark:text-cream-faint">
          Không có bài viết nào khớp bộ lọc.
        </p>
      ) : (
        <div className="slim-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink/80 text-xs tracking-[0.14em] uppercase text-ink-faint dark:border-cream/60 dark:text-cream-faint">
                <th className="py-3 pr-4 font-medium">Tiêu đề</th>
                <th className="py-3 pr-4 font-medium">Chuyên mục</th>
                <th className="py-3 pr-4 font-medium">Trạng thái</th>
                <th className="py-3 pr-4 text-right font-medium">Lượt xem</th>
                <th className="py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-ink/10 dark:border-cream/10">
                  <td className="max-w-xs py-3.5 pr-4">
                    <Link href={`/admin/posts/${p.id}`} className="link-sweep font-medium text-ink dark:text-paper">
                      {p.title}
                    </Link>
                    {!!p.featured && (
                      <span className="ml-2 bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                        NỔI BẬT
                      </span>
                    )}
                    <p className="mt-0.5 truncate font-mono text-xs text-ink-faint dark:text-cream-faint">
                      /{p.slug}
                    </p>
                  </td>
                  <td className="py-3.5 pr-4 text-ink-soft dark:text-cream-faint">
                    {p.category_name ?? "—"}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`px-2 py-1 font-mono text-[11px] ${
                        p.status === "published"
                          ? "bg-ink/10 text-ink-soft dark:bg-cream/10 dark:text-cream-faint"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {p.status === "published" ? "Đã đăng" : "Nháp"}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-right font-mono text-xs text-ink-soft dark:text-cream-faint">
                    {p.views.toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex justify-end gap-3 text-xs">
                      {p.status === "published" && (
                        <Link href={`/blog/${p.slug}`} target="_blank" className="link-sweep text-ink-faint dark:text-cream-faint">
                          Xem
                        </Link>
                      )}
                      <Link href={`/admin/posts/${p.id}`} className="link-sweep text-accent">
                        Sửa
                      </Link>
                      <button onClick={() => remove(p)} className="link-sweep text-ink-faint hover:text-accent dark:text-cream-faint">
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
