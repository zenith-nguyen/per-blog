import { slugify } from "./markdown";
import type { PostInput } from "./repo";

/** Validate + normalize a post payload from the admin editor. */
export function parsePostInput(body: Record<string, unknown>): PostInput | { message: string } {
  const title = String(body?.title ?? "").trim();
  if (!title) return { message: "Tiêu đề không được để trống." };
  const content = String(body?.content ?? "");
  if (!content.trim()) return { message: "Nội dung không được để trống." };
  const slug = slugify(String(body?.slug ?? "") || title);
  if (!slug) return { message: "Slug không hợp lệ." };
  const status = body?.status === "published" ? ("published" as const) : ("draft" as const);
  return {
    title,
    slug,
    excerpt: String(body?.excerpt ?? "").trim(),
    content,
    cover_image: body?.cover_image ? String(body.cover_image) : null,
    status,
    featured: !!body?.featured,
    category_id: body?.category_id ? Number(body.category_id) : null,
    tag_ids: Array.isArray(body?.tag_ids) ? body.tag_ids.map(Number).filter(Boolean) : [],
  };
}
