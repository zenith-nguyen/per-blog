import PostEditor from "@/components/admin/PostEditor";

export const metadata = { title: "Viết bài mới" };

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-8 font-display text-4xl font-semibold text-ink dark:text-paper">
        Viết bài mới
      </h1>
      <PostEditor />
    </div>
  );
}
