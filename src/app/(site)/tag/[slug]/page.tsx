import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { getTagBySlug, listPosts } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = getTagBySlug(slug);
  if (!tag) notFound();
  const { posts, total } = listPosts({ tag: slug, perPage: 50 });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="rise rise-1 border-b-2 border-ink/80 pb-8 dark:border-cream/60">
        <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">Thẻ</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-ink dark:text-paper">
          #{tag.slug}
        </h1>
        <p className="mt-2 text-sm text-ink-faint dark:text-cream-faint">{total} bài viết</p>
      </header>
      <div className="rise rise-2 mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>
      <Link href="/blog" className="link-sweep mt-12 inline-block text-sm text-accent">
        ⟵ Tất cả bài viết
      </Link>
    </div>
  );
}
