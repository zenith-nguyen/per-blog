import Link from "next/link";
import PostCard, { formatDate } from "@/components/PostCard";
import { getFeaturedPost, getSettings, listCategories, listPosts } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const settings = getSettings();
  const featured = getFeaturedPost();
  const { posts } = listPosts({ perPage: 6 });
  const categories = listCategories().filter((c) => (c.post_count ?? 0) > 0);
  const latest = posts.filter((p) => p.id !== featured?.id).slice(0, 5);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink/10 dark:border-cream/10">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <p className="rise rise-1 font-mono text-xs tracking-[0.3em] text-accent uppercase">
            {settings.site_tagline}
          </p>
          <h1 className="rise rise-2 mt-5 max-w-3xl font-display text-5xl leading-[1.05] font-semibold tracking-tight text-ink md:text-7xl dark:text-paper">
            Viết ra là cách tốt nhất để{" "}
            <em className="text-accent not-italic underline decoration-2 underline-offset-8">
              hiểu
            </em>{" "}
            một vấn đề.
          </h1>
          <p className="rise rise-3 mt-6 max-w-xl text-lg leading-relaxed text-ink-soft dark:text-cream-faint">
            {settings.site_description}
          </p>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="border-b border-ink/10 dark:border-cream/10">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <div className="rise rise-3 grid gap-8 md:grid-cols-[1fr_2fr]">
              <div className="flex flex-col justify-between">
                <span className="inline-block w-fit bg-accent px-3 py-1 font-mono text-xs tracking-[0.2em] text-paper uppercase">
                  Bài nổi bật
                </span>
                <div className="mt-6 hidden text-sm text-ink-faint md:block dark:text-cream-faint">
                  <p>{featured.category_name}</p>
                  <p className="mt-1">{formatDate(featured.published_at)}</p>
                  <p className="mt-1">{featured.reading_minutes} phút đọc</p>
                </div>
              </div>
              <div className="group relative">
                <h2 className="font-display text-3xl leading-tight font-semibold text-ink md:text-5xl dark:text-paper">
                  <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0">
                    <span className="bg-gradient-to-r from-accent to-accent bg-[length:0%_3px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_3px]">
                      {featured.title}
                    </span>
                  </Link>
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft dark:text-cream-faint">
                  {featured.excerpt}
                </p>
                <p className="mt-5 font-mono text-sm text-accent">Đọc tiếp ⟶</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest + categories */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="mb-8 flex items-baseline justify-between">
              <h2 className="font-display text-3xl font-semibold text-ink dark:text-paper">
                Bài mới
              </h2>
              <Link href="/blog" className="link-sweep text-sm font-medium text-accent">
                Xem tất cả ⟶
              </Link>
            </div>
            <div className="grid gap-10 sm:grid-cols-2">
              {latest.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>

          <aside>
            <h2 className="font-display text-xl font-semibold text-ink dark:text-paper">
              Chuyên mục
            </h2>
            <ul className="mt-5 space-y-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="group flex items-baseline justify-between border-b border-ink/10 py-3 text-sm dark:border-cream/10"
                  >
                    <span className="text-ink-soft transition-colors group-hover:text-accent dark:text-cream-faint">
                      {c.name}
                    </span>
                    <span className="font-mono text-xs text-ink-faint dark:text-cream-faint">
                      {String(c.post_count).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 border border-ink/15 bg-paper-warm p-6 dark:border-cream/15 dark:bg-night-soft">
              <p className="font-display text-lg font-semibold text-ink dark:text-paper">
                {settings.author_name}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-cream-faint">
                {settings.author_bio}
              </p>
              <Link href="/about" className="link-sweep mt-4 inline-block text-sm text-accent">
                Về tôi ⟶
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
