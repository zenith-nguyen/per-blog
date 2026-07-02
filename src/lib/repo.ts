// Repository layer — every SQL query in the app lives here.
// Pages and API routes never write raw SQL themselves (docs/ARCHITECTURE.md).
import { getDb } from "./db";
import { readingMinutes } from "./markdown";
import type { Category, Comment, DashboardStats, Post, SiteSettings, Tag } from "./types";

const POST_COLUMNS = `
  p.*, c.name AS category_name, c.slug AS category_slug
`;

function attachTags(posts: Post[]): Post[] {
  if (posts.length === 0) return posts;
  const db = getDb();
  const ids = posts.map((p) => p.id);
  const rows = db
    .prepare(
      `SELECT pt.post_id, t.id, t.name, t.slug FROM post_tags pt
       JOIN tags t ON t.id = pt.tag_id
       WHERE pt.post_id IN (${ids.map(() => "?").join(",")})
       ORDER BY t.name`
    )
    .all(...ids) as (Tag & { post_id: number })[];
  const byPost = new Map<number, Tag[]>();
  for (const r of rows) {
    const list = byPost.get(r.post_id) ?? [];
    list.push({ id: r.id, name: r.name, slug: r.slug });
    byPost.set(r.post_id, list);
  }
  return posts.map((p) => ({ ...p, tags: byPost.get(p.id) ?? [] }));
}

// ---------------------------------------------------------------- public read

export interface PostQuery {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string; // slug
  tag?: string; // slug
  status?: "draft" | "published" | "all";
}

export function listPosts(q: PostQuery = {}): { posts: Post[]; total: number } {
  const db = getDb();
  const perPage = q.perPage ?? 6;
  const page = Math.max(1, q.page ?? 1);
  const where: string[] = [];
  const params: unknown[] = [];

  if (q.status === "all") {
    // no status filter (admin)
  } else if (q.status === "draft") {
    where.push("p.status = 'draft'");
  } else {
    where.push("p.status = 'published'");
  }
  if (q.search) {
    where.push("(p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)");
    const like = `%${q.search}%`;
    params.push(like, like, like);
  }
  if (q.category) {
    where.push("c.slug = ?");
    params.push(q.category);
  }
  if (q.tag) {
    where.push("p.id IN (SELECT post_id FROM post_tags pt2 JOIN tags t2 ON t2.id = pt2.tag_id WHERE t2.slug = ?)");
    params.push(q.tag);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (
    db
      .prepare(`SELECT COUNT(*) AS n FROM posts p LEFT JOIN categories c ON c.id = p.category_id ${whereSql}`)
      .get(...params) as { n: number }
  ).n;

  const posts = db
    .prepare(
      `SELECT ${POST_COLUMNS} FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
       ${whereSql}
       ORDER BY COALESCE(p.published_at, p.updated_at) DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, perPage, (page - 1) * perPage) as Post[];

  return { posts: attachTags(posts), total };
}

export function getPostBySlug(slug: string, publishedOnly = true): Post | null {
  const db = getDb();
  const post = db
    .prepare(
      `SELECT ${POST_COLUMNS} FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ? ${publishedOnly ? "AND p.status = 'published'" : ""}`
    )
    .get(slug) as Post | undefined;
  return post ? attachTags([post])[0] : null;
}

export function getPostById(id: number): Post | null {
  const db = getDb();
  const post = db
    .prepare(
      `SELECT ${POST_COLUMNS} FROM posts p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?`
    )
    .get(id) as Post | undefined;
  return post ? attachTags([post])[0] : null;
}

export function getFeaturedPost(): Post | null {
  const db = getDb();
  const post = db
    .prepare(
      `SELECT ${POST_COLUMNS} FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.status = 'published' AND p.featured = 1
       ORDER BY p.published_at DESC LIMIT 1`
    )
    .get() as Post | undefined;
  return post ? attachTags([post])[0] : null;
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT ${POST_COLUMNS} FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.status = 'published' AND p.id != ?
       ORDER BY (p.category_id = ?) DESC, p.published_at DESC
       LIMIT ?`
    )
    .all(post.id, post.category_id, limit) as Post[];
  return attachTags(rows);
}

export function recordView(slug: string): void {
  const db = getDb();
  const post = db.prepare("SELECT id FROM posts WHERE slug = ? AND status = 'published'").get(slug) as
    | { id: number }
    | undefined;
  if (!post) return;
  const today = new Date().toISOString().slice(0, 10);
  db.prepare(
    `INSERT INTO post_views (post_id, date, count) VALUES (?, ?, 1)
     ON CONFLICT(post_id, date) DO UPDATE SET count = count + 1`
  ).run(post.id, today);
  db.prepare("UPDATE posts SET views = views + 1 WHERE id = ?").run(post.id);
}

// ------------------------------------------------------------------ taxonomy

export function listCategories(): Category[] {
  return getDb()
    .prepare(
      `SELECT c.*, COUNT(p.id) AS post_count FROM categories c
       LEFT JOIN posts p ON p.category_id = c.id AND p.status = 'published'
       GROUP BY c.id ORDER BY c.name`
    )
    .all() as Category[];
}

export function listTags(): Tag[] {
  return getDb()
    .prepare(
      `SELECT t.*, COUNT(pt.post_id) AS post_count FROM tags t
       LEFT JOIN post_tags pt ON pt.tag_id = t.id
       GROUP BY t.id ORDER BY t.name`
    )
    .all() as Tag[];
}

export function getCategoryBySlug(slug: string): Category | null {
  return (getDb().prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as Category) ?? null;
}

export function getTagBySlug(slug: string): Tag | null {
  return (getDb().prepare("SELECT * FROM tags WHERE slug = ?").get(slug) as Tag) ?? null;
}

// -------------------------------------------------------------- admin: posts

export interface PostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  status: "draft" | "published";
  featured: boolean;
  category_id: number | null;
  tag_ids: number[];
}

export function createPost(input: PostInput): Post {
  const db = getDb();
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const tx = db.transaction(() => {
    const r = db
      .prepare(
        `INSERT INTO posts (title, slug, excerpt, content, cover_image, status, featured,
           category_id, reading_minutes, published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.title,
        input.slug,
        input.excerpt,
        input.content,
        input.cover_image,
        input.status,
        input.featured ? 1 : 0,
        input.category_id,
        readingMinutes(input.content),
        input.status === "published" ? now : null,
        now,
        now
      );
    const id = Number(r.lastInsertRowid);
    const ins = db.prepare("INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)");
    for (const t of input.tag_ids) ins.run(id, t);
    return id;
  });
  return getPostById(tx())!;
}

export function updatePost(id: number, input: PostInput): Post | null {
  const db = getDb();
  const existing = getPostById(id);
  if (!existing) return null;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  // First transition draft → published stamps published_at.
  const publishedAt =
    input.status === "published" ? existing.published_at ?? now : existing.published_at;
  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE posts SET title=?, slug=?, excerpt=?, content=?, cover_image=?, status=?,
         featured=?, category_id=?, reading_minutes=?, published_at=?, updated_at=? WHERE id=?`
    ).run(
      input.title,
      input.slug,
      input.excerpt,
      input.content,
      input.cover_image,
      input.status,
      input.featured ? 1 : 0,
      input.category_id,
      readingMinutes(input.content),
      publishedAt,
      now,
      id
    );
    db.prepare("DELETE FROM post_tags WHERE post_id = ?").run(id);
    const ins = db.prepare("INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)");
    for (const t of input.tag_ids) ins.run(id, t);
  });
  tx();
  return getPostById(id);
}

export function deletePost(id: number): boolean {
  return getDb().prepare("DELETE FROM posts WHERE id = ?").run(id).changes > 0;
}

export function slugExists(slug: string, excludeId?: number): boolean {
  const row = excludeId
    ? getDb().prepare("SELECT 1 FROM posts WHERE slug = ? AND id != ?").get(slug, excludeId)
    : getDb().prepare("SELECT 1 FROM posts WHERE slug = ?").get(slug);
  return !!row;
}

// ----------------------------------------------------------- admin: taxonomy

export function createCategory(name: string, slug: string, description: string): Category {
  const r = getDb()
    .prepare("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)")
    .run(name, slug, description);
  return getDb().prepare("SELECT * FROM categories WHERE id = ?").get(r.lastInsertRowid) as Category;
}

export function deleteCategory(id: number): boolean {
  return getDb().prepare("DELETE FROM categories WHERE id = ?").run(id).changes > 0;
}

export function createTag(name: string, slug: string): Tag {
  const r = getDb().prepare("INSERT INTO tags (name, slug) VALUES (?, ?)").run(name, slug);
  return getDb().prepare("SELECT * FROM tags WHERE id = ?").get(r.lastInsertRowid) as Tag;
}

export function deleteTag(id: number): boolean {
  return getDb().prepare("DELETE FROM tags WHERE id = ?").run(id).changes > 0;
}

// ----------------------------------------------------------------- comments

export function listApprovedComments(postId: number): Comment[] {
  return getDb()
    .prepare(
      "SELECT * FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at ASC"
    )
    .all(postId) as Comment[];
}

export function createComment(postId: number, author: string, content: string): Comment {
  const r = getDb()
    .prepare("INSERT INTO comments (post_id, author_name, content, status) VALUES (?, ?, ?, 'pending')")
    .run(postId, author, content);
  return getDb().prepare("SELECT * FROM comments WHERE id = ?").get(r.lastInsertRowid) as Comment;
}

export function listAllComments(status?: string): Comment[] {
  const db = getDb();
  const base = `SELECT cm.*, p.title AS post_title, p.slug AS post_slug
    FROM comments cm JOIN posts p ON p.id = cm.post_id`;
  if (status && status !== "all") {
    return db.prepare(`${base} WHERE cm.status = ? ORDER BY cm.created_at DESC`).all(status) as Comment[];
  }
  return db.prepare(`${base} ORDER BY cm.created_at DESC`).all() as Comment[];
}

export function setCommentStatus(id: number, status: "pending" | "approved" | "spam"): boolean {
  return getDb().prepare("UPDATE comments SET status = ? WHERE id = ?").run(status, id).changes > 0;
}

export function deleteComment(id: number): boolean {
  return getDb().prepare("DELETE FROM comments WHERE id = ?").run(id).changes > 0;
}

// ----------------------------------------------------------------- settings

export function getSettings(): SiteSettings {
  const rows = getDb().prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    site_title: map.site_title ?? "Blog",
    site_tagline: map.site_tagline ?? "",
    site_description: map.site_description ?? "",
    author_name: map.author_name ?? "",
    author_bio: map.author_bio ?? "",
    social_github: map.social_github ?? "",
    social_twitter: map.social_twitter ?? "",
    social_email: map.social_email ?? "",
    posts_per_page: map.posts_per_page ?? "6",
  };
}

export function updateSettings(values: Partial<SiteSettings>): SiteSettings {
  const db = getDb();
  const up = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  );
  const tx = db.transaction(() => {
    for (const [k, v] of Object.entries(values)) up.run(k, String(v));
  });
  tx();
  return getSettings();
}

// ---------------------------------------------------------------- dashboard

export function getDashboardStats(): DashboardStats {
  const db = getDb();
  const one = <T>(sql: string, ...p: unknown[]) => db.prepare(sql).get(...p) as T;

  const totalPosts = one<{ n: number }>("SELECT COUNT(*) AS n FROM posts").n;
  const publishedPosts = one<{ n: number }>("SELECT COUNT(*) AS n FROM posts WHERE status='published'").n;
  const totalViews = one<{ n: number }>("SELECT COALESCE(SUM(views),0) AS n FROM posts").n;
  const cutoff = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const viewsLast30 = one<{ n: number }>(
    "SELECT COALESCE(SUM(count),0) AS n FROM post_views WHERE date >= ?",
    cutoff
  ).n;
  const pendingComments = one<{ n: number }>("SELECT COUNT(*) AS n FROM comments WHERE status='pending'").n;
  const totalComments = one<{ n: number }>("SELECT COUNT(*) AS n FROM comments").n;

  // Continuous 30-day series (fills days with zero views).
  const raw = db
    .prepare("SELECT date, SUM(count) AS count FROM post_views WHERE date >= ? GROUP BY date")
    .all(cutoff) as { date: string; count: number }[];
  const byDate = new Map(raw.map((r) => [r.date, r.count]));
  const viewsByDay: { date: string; count: number }[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
    viewsByDay.push({ date, count: byDate.get(date) ?? 0 });
  }

  const topPosts = db
    .prepare(
      "SELECT id, title, slug, views FROM posts WHERE status='published' ORDER BY views DESC LIMIT 5"
    )
    .all() as DashboardStats["topPosts"];

  const recentComments = db
    .prepare(
      `SELECT cm.*, p.title AS post_title, p.slug AS post_slug FROM comments cm
       JOIN posts p ON p.id = cm.post_id ORDER BY cm.created_at DESC LIMIT 5`
    )
    .all() as Comment[];

  return {
    totalPosts,
    publishedPosts,
    draftPosts: totalPosts - publishedPosts,
    totalViews,
    viewsLast30,
    pendingComments,
    totalComments,
    viewsByDay,
    topPosts,
    recentComments,
  };
}
