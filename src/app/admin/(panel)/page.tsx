import Link from "next/link";
import { getDashboardStats } from "@/lib/repo";
import ViewsChart from "@/components/admin/ViewsChart";
import { formatDate } from "@/components/PostCard";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  spam: "Spam",
};

export default function AdminDashboard() {
  const stats = getDashboardStats();

  const cards = [
    { label: "Tổng bài viết", value: stats.totalPosts, sub: `${stats.publishedPosts} đã đăng · ${stats.draftPosts} nháp` },
    { label: "Tổng lượt xem", value: stats.totalViews, sub: `${stats.viewsLast30.toLocaleString("vi-VN")} trong 30 ngày` },
    { label: "Bình luận", value: stats.totalComments, sub: `${stats.pendingComments} chờ duyệt` },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <header className="rise rise-1 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink dark:text-paper">Tổng quan</h1>
          <p className="mt-1 text-sm text-ink-faint dark:text-cream-faint">
            Báo cáo hoạt động của blog trong 30 ngày gần nhất.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-vermilion px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-vermilion-deep"
        >
          + Viết bài mới
        </Link>
      </header>

      <div className="rise rise-2 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="border border-ink/15 bg-paper-warm p-5 dark:border-cream/15 dark:bg-night-soft">
            <p className="text-xs tracking-[0.14em] uppercase text-ink-faint dark:text-cream-faint">{c.label}</p>
            <p className="mt-2 font-display text-4xl font-semibold text-ink dark:text-paper">
              {c.value.toLocaleString("vi-VN")}
            </p>
            <p className="mt-1 text-xs text-ink-faint dark:text-cream-faint">{c.sub}</p>
          </div>
        ))}
      </div>

      <section className="rise rise-3 mt-8 border border-ink/15 bg-paper-warm p-6 dark:border-cream/15 dark:bg-night-soft">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink dark:text-paper">
          Lượt xem 30 ngày
        </h2>
        <ViewsChart data={stats.viewsByDay} />
        <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-faint dark:text-cream-faint">
          <span>{stats.viewsByDay[0]?.date}</span>
          <span>{stats.viewsByDay.at(-1)?.date}</span>
        </div>
      </section>

      <div className="rise rise-4 mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-ink dark:text-paper">
            Bài viết được đọc nhiều
          </h2>
          <ol className="space-y-3">
            {stats.topPosts.map((p, i) => (
              <li key={p.id} className="flex items-baseline gap-3 border-b border-ink/10 pb-3 dark:border-cream/10">
                <span className="font-mono text-sm text-vermilion">{String(i + 1).padStart(2, "0")}</span>
                <Link href={`/blog/${p.slug}`} className="link-sweep min-w-0 flex-1 truncate text-sm text-ink dark:text-paper">
                  {p.title}
                </Link>
                <span className="font-mono text-xs text-ink-faint dark:text-cream-faint">
                  {p.views.toLocaleString("vi-VN")}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl font-semibold text-ink dark:text-paper">
            Bình luận gần đây
          </h2>
          <ul className="space-y-3">
            {stats.recentComments.map((c) => (
              <li key={c.id} className="border-b border-ink/10 pb-3 text-sm dark:border-cream/10">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink dark:text-paper">{c.author_name}</span>
                  <span
                    className={`px-2 py-0.5 font-mono text-[11px] ${
                      c.status === "pending"
                        ? "bg-vermilion/15 text-vermilion"
                        : c.status === "approved"
                          ? "bg-ink/10 text-ink-soft dark:bg-cream/10 dark:text-cream-faint"
                          : "bg-ink/20 text-ink-faint line-through dark:bg-cream/5 dark:text-cream-faint"
                    }`}
                  >
                    {STATUS_LABEL[c.status]}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-ink-soft dark:text-cream-faint">{c.content}</p>
                <p className="mt-1 text-xs text-ink-faint dark:text-cream-faint">
                  trên “{c.post_title}” · {formatDate(c.created_at)}
                </p>
              </li>
            ))}
          </ul>
          <Link href="/admin/comments" className="link-sweep mt-4 inline-block text-sm text-vermilion">
            Quản lý bình luận ⟶
          </Link>
        </section>
      </div>
    </div>
  );
}
