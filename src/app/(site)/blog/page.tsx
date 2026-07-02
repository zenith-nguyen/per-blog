import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getSettings, listCategories, listPosts, listTags } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bài viết" };

interface Props {
  searchParams: Promise<{ q?: string; page?: string; category?: string; tag?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const settings = getSettings();
  const perPage = Number(settings.posts_per_page) || 6;
  const page = Math.max(1, Number(sp.page) || 1);
  const { posts, total } = listPosts({
    page,
    perPage,
    search: sp.q,
    category: sp.category,
    tag: sp.tag,
  });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const categories = listCategories().filter((c) => (c.post_count ?? 0) > 0);
  const tags = listTags().filter((t) => (t.post_count ?? 0) > 0);

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q: sp.q, category: sp.category, tag: sp.tag, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="rise rise-1 border-b-2 border-ink/80 pb-8 dark:border-cream/60">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-ink md:text-6xl dark:text-paper">
          Tất cả bài viết
        </h1>
        <p className="mt-3 text-ink-faint dark:text-cream-faint">
          {total} bài viết{sp.q ? ` cho từ khoá "${sp.q}"` : ""}
          {sp.category ? ` trong chuyên mục đã chọn` : ""}
          {sp.tag ? ` với thẻ đã chọn` : ""}
        </p>

        {/* Search */}
        <form action="/blog" method="GET" className="mt-6 flex max-w-lg gap-0" role="search">
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Tìm theo tiêu đề hoặc nội dung…"
            aria-label="Tìm kiếm bài viết"
            className="w-full border border-ink/25 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-accent dark:border-cream/25"
          />
          <button
            type="submit"
            className="shrink-0 bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-accent dark:bg-paper dark:text-ink dark:hover:bg-accent dark:hover:text-paper"
          >
            Tìm
          </button>
        </form>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          <Link
            href={buildQuery({ category: undefined, tag: undefined })}
            className={`border px-3 py-1.5 transition-colors ${
              !sp.category && !sp.tag
                ? "border-accent bg-accent text-paper"
                : "border-ink/20 text-ink-soft hover:border-accent dark:border-cream/20 dark:text-cream-faint"
            }`}
          >
            Tất cả
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={buildQuery({ category: c.slug, tag: undefined })}
              className={`border px-3 py-1.5 transition-colors ${
                sp.category === c.slug
                  ? "border-accent bg-accent text-paper"
                  : "border-ink/20 text-ink-soft hover:border-accent dark:border-cream/20 dark:text-cream-faint"
              }`}
            >
              {c.name}
            </Link>
          ))}
          <span className="mx-1 text-ink-faint dark:text-cream-faint">·</span>
          {tags.map((t) => (
            <Link
              key={t.id}
              href={buildQuery({ tag: t.slug, category: undefined })}
              className={`px-2 py-1.5 font-mono transition-colors ${
                sp.tag === t.slug
                  ? "text-accent underline underline-offset-4"
                  : "text-ink-faint hover:text-accent dark:text-cream-faint"
              }`}
            >
              #{t.slug}
            </Link>
          ))}
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="rise rise-2 py-20 text-center">
          <p className="font-display text-3xl text-ink-faint dark:text-cream-faint">
            Không tìm thấy bài viết nào.
          </p>
          <Link href="/blog" className="link-sweep mt-4 inline-block text-accent">
            Xoá bộ lọc ⟶
          </Link>
        </div>
      ) : (
        <div className="rise rise-2 mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={(page - 1) * perPage + i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="mt-14 flex items-center justify-center gap-2 font-mono text-sm"
          aria-label="Phân trang"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildQuery({ page: p === 1 ? undefined : String(p) } as Record<string, string | undefined>)}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 w-9 items-center justify-center border transition-colors ${
                p === page
                  ? "border-accent bg-accent text-paper"
                  : "border-ink/20 hover:border-accent dark:border-cream/20"
              }`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
