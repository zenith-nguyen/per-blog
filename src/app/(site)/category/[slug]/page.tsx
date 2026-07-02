import Link from "next/link";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { getCategoryBySlug, listPosts } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();
  const { posts, total } = listPosts({ category: slug, perPage: 50 });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <header className="rise rise-1 border-b-2 border-ink/80 pb-8 dark:border-cream/60">
        <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">Chuyên mục</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-ink dark:text-paper">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-3 max-w-xl text-ink-soft dark:text-cream-faint">{category.description}</p>
        )}
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
