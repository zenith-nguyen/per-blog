import Link from "next/link";
import type { Post } from "@/lib/types";

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso.replace(" ", "T"));
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
}

export default function PostCard({ post, index }: { post: Post; index?: number }) {
  return (
    <article className="group relative flex flex-col border-t-2 border-ink/80 pt-5 transition-colors dark:border-cream/60">
      <div className="mb-3 flex items-baseline justify-between gap-3 text-xs tracking-[0.14em] text-ink-faint uppercase dark:text-cream-faint">
        <span>
          {typeof index === "number" && (
            <span className="mr-2 font-mono text-vermilion">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          {post.category_name ?? "Chưa phân loại"}
        </span>
        <span>{formatDate(post.published_at)}</span>
      </div>

      <h3 className="font-display text-2xl leading-snug font-semibold text-ink dark:text-paper">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
          <span className="bg-gradient-to-r from-vermilion to-vermilion bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
            {post.title}
          </span>
        </Link>
      </h3>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft dark:text-cream-faint">
        {post.excerpt}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-ink-faint dark:text-cream-faint">
        <span>{post.reading_minutes} phút đọc</span>
        <span aria-hidden>·</span>
        <span>{post.views.toLocaleString("vi-VN")} lượt xem</span>
        <span
          aria-hidden
          className="ml-auto translate-x-0 text-vermilion transition-transform duration-300 group-hover:translate-x-1.5"
        >
          ⟶
        </span>
      </div>
    </article>
  );
}
