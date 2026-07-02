import { getSettings, listPosts } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Về tôi" };

export default function AboutPage() {
  const settings = getSettings();
  const { total } = listPosts({ perPage: 1 });

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="rise rise-1 font-mono text-xs tracking-[0.3em] text-accent uppercase">
        Về tôi
      </p>
      <h1 className="rise rise-2 mt-4 font-display text-5xl leading-tight font-semibold tracking-tight text-ink md:text-6xl dark:text-paper">
        Xin chào, tôi là {settings.author_name}.
      </h1>
      <div className="rise rise-3 prose-ink mt-8">
        <p>{settings.author_bio}</p>
        <p>
          Blog này là nơi tôi lưu giữ những ghi chép — về lập trình, về việc xây dựng sản phẩm, về
          những cuốn sách đang đọc và những suy nghĩ chậm rãi giữa đời thường. Hiện có {total} bài
          viết được xuất bản.
        </p>
        <p>
          Toàn bộ blog được xây bằng Next.js và SQLite, chạy trên một tiến trình duy nhất. Mã nguồn
          và tài liệu kỹ thuật nằm trong thư mục <code>docs/</code> của repo.
        </p>
      </div>
      <div className="rise rise-4 mt-10 flex flex-wrap gap-4 text-sm">
        {settings.social_github && (
          <a
            href={settings.social_github}
            target="_blank"
            rel="noreferrer"
            className="border border-ink/25 px-5 py-2.5 transition-colors hover:border-accent hover:text-accent dark:border-cream/25"
          >
            GitHub ⟶
          </a>
        )}
        {settings.social_email && (
          <a
            href={`mailto:${settings.social_email}`}
            className="border border-ink/25 px-5 py-2.5 transition-colors hover:border-accent hover:text-accent dark:border-cream/25"
          >
            Gửi email ⟶
          </a>
        )}
      </div>
    </div>
  );
}
