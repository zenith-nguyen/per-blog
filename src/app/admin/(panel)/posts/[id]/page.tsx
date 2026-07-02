import { notFound } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { getPostById } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sửa bài viết" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPostById(Number(id));
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-8 font-display text-4xl font-semibold text-ink dark:text-paper">
        Sửa bài viết
      </h1>
      <PostEditor post={post} />
    </div>
  );
}
