import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PostCard, { formatDate } from "@/components/PostCard";
import CommentSection from "@/components/CommentSection";
import ViewTracker from "@/components/ViewTracker";
import { renderMarkdown } from "@/lib/markdown";
import { getPostBySlug, getRelatedPosts, getSettings, listApprovedComments } from "@/lib/repo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Không tìm thấy" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const settings = getSettings();
  const related = getRelatedPosts(post);
  const comments = listApprovedComments(post.id);
  // Post content is trusted single-author markdown written in the admin CMS.
  const html = renderMarkdown(post.content);

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <ViewTracker slug={post.slug} />

      <header className="rise rise-1">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-[0.18em] uppercase">
          {post.category_slug && (
            <Link
              href={`/category/${post.category_slug}`}
              className="bg-accent px-2.5 py-1 text-paper"
            >
              {post.category_name}
            </Link>
          )}
          <span className="text-ink-faint dark:text-cream-faint">
            {formatDate(post.published_at)}
          </span>
        </div>

        <h1 className="mt-6 font-display text-4xl leading-[1.12] font-semibold tracking-tight text-ink md:text-5xl dark:text-paper">
          {post.title}
        </h1>

        <p className="mt-5 font-display text-lg leading-relaxed text-ink-soft italic dark:text-cream-faint">
          {post.excerpt}
        </p>

        <div className="mt-6 flex items-center gap-4 border-y border-ink/15 py-3 text-xs text-ink-faint dark:border-cream/15 dark:text-cream-faint">
          <span className="font-medium text-ink dark:text-paper">{settings.author_name}</span>
          <span aria-hidden>·</span>
          <span>{post.reading_minutes} phút đọc</span>
          <span aria-hidden>·</span>
          <span>{post.views.toLocaleString("vi-VN")} lượt xem</span>
        </div>
      </header>

      <div
        className="prose-ink rise rise-2 mt-10"
        // Trusted content: markdown is authored only by the authenticated admin.
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {post.tags && post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Link
              key={t.id}
              href={`/tag/${t.slug}`}
              className="border border-ink/20 px-3 py-1 font-mono text-xs text-ink-soft transition-colors hover:border-accent hover:text-accent dark:border-cream/20 dark:text-cream-faint"
            >
              #{t.slug}
            </Link>
          ))}
        </div>
      )}

      <CommentSection postId={post.id} initialComments={comments} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 font-display text-2xl font-semibold text-ink dark:text-paper">
            Đọc tiếp
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
