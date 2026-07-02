import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { scryptSync, randomBytes } from "crypto";

// Single shared connection (better-sqlite3 is synchronous — safe for a
// localhost single-process deployment). Survives Next.js hot reloads via
// globalThis so we don't leak file handles in dev.
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "blog.db");

declare global {
  // eslint-disable-next-line no-var
  var __blogDb: Database.Database | undefined;
}

export function getDb(): Database.Database {
  if (globalThis.__blogDb) return globalThis.__blogDb;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL"); // concurrent reads while writing
  db.pragma("foreign_keys = ON");
  migrate(db);
  seedIfEmpty(db);
  globalThis.__blogDb = db;
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name  TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL UNIQUE,
      slug        TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS tags (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS posts (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      title           TEXT NOT NULL,
      slug            TEXT NOT NULL UNIQUE,
      excerpt         TEXT NOT NULL DEFAULT '',
      content         TEXT NOT NULL DEFAULT '',
      cover_image     TEXT,
      status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
      featured        INTEGER NOT NULL DEFAULT 0,
      category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      views           INTEGER NOT NULL DEFAULT 0,
      reading_minutes INTEGER NOT NULL DEFAULT 1,
      published_at    TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);

    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      content     TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','spam')),
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, status);

    -- Daily view aggregates power the admin dashboard chart.
    CREATE TABLE IF NOT EXISTS post_views (
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      date    TEXT NOT NULL, -- YYYY-MM-DD
      count   INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (post_id, date)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64).toString("hex");
  return candidate === hash;
}

// ---------------------------------------------------------------------------
// Seed: first run creates the admin account, settings, and demo content so the
// product is explorable immediately. Reset with `npm run db:seed`.
// ---------------------------------------------------------------------------

function seedIfEmpty(db: Database.Database) {
  const hasUser = db.prepare("SELECT 1 FROM users LIMIT 1").get();
  if (hasUser) return;

  const tx = db.transaction(() => {
    db.prepare(
      "INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)"
    ).run("nhathuycr123@gmail.com", hashPassword("huinhat_01657"), "Nhật Nguyễn");

    const settings: Record<string, string> = {
      site_title: "Mực & Giấy",
      site_tagline: "Ghi chép cá nhân về code, sản phẩm và cuộc sống",
      site_description:
        "Blog cá nhân của Nhật — nơi lưu những ghi chép về lập trình, xây dựng sản phẩm, và những điều đáng suy nghĩ.",
      author_name: "Nhật Nguyễn",
      author_bio:
        "Kỹ sư phần mềm thích viết. Tin rằng viết ra là cách tốt nhất để hiểu một vấn đề.",
      social_github: "https://github.com/zenith-nguyen",
      social_twitter: "",
      social_email: "nhat.h.nguyen@realstake.io",
      posts_per_page: "6",
    };
    const insSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    for (const [k, v] of Object.entries(settings)) insSetting.run(k, v);

    const insCat = db.prepare(
      "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)"
    );
    const catIds: Record<string, number> = {};
    for (const c of [
      ["Lập trình", "lap-trinh", "Kỹ thuật, kiến trúc, và những bài học khi viết code."],
      ["Sản phẩm", "san-pham", "Xây dựng sản phẩm: từ ý tưởng đến bàn giao."],
      ["Đọc & Nghĩ", "doc-va-nghi", "Ghi chú đọc sách và những suy nghĩ chậm."],
      ["Cuộc sống", "cuoc-song", "Những mảnh đời thường đáng giữ lại."],
    ]) {
      const r = insCat.run(c[0], c[1], c[2]);
      catIds[c[1]] = Number(r.lastInsertRowid);
    }

    const insTag = db.prepare("INSERT INTO tags (name, slug) VALUES (?, ?)");
    const tagIds: Record<string, number> = {};
    for (const t of [
      ["TypeScript", "typescript"],
      ["Next.js", "nextjs"],
      ["SQLite", "sqlite"],
      ["Kiến trúc", "kien-truc"],
      ["Năng suất", "nang-suat"],
      ["Viết lách", "viet-lach"],
      ["Sách", "sach"],
      ["UX", "ux"],
    ]) {
      const r = insTag.run(t[0], t[1]);
      tagIds[t[1]] = Number(r.lastInsertRowid);
    }

    const insPost = db.prepare(`
      INSERT INTO posts (title, slug, excerpt, content, cover_image, status, featured,
        category_id, views, reading_minutes, published_at, created_at, updated_at)
      VALUES (@title, @slug, @excerpt, @content, @cover_image, @status, @featured,
        @category_id, @views, @reading_minutes, @published_at, @published_at, @published_at)
    `);
    const insPostTag = db.prepare("INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)");

    const daysAgo = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toISOString().replace("T", " ").slice(0, 19);
    };

    const posts = [
      {
        title: "Vì sao tôi chọn SQLite cho blog cá nhân",
        slug: "vi-sao-toi-chon-sqlite-cho-blog-ca-nhan",
        excerpt:
          "Không phải dự án nào cũng cần Postgres. Với một blog cá nhân, SQLite là lựa chọn gần như hoàn hảo: một file duy nhất, không server, backup bằng lệnh copy.",
        cover_image: null,
        featured: 1,
        category_id: catIds["lap-trinh"],
        tags: ["sqlite", "kien-truc"],
        published_at: daysAgo(3),
        content: `Khi bắt đầu xây blog này, câu hỏi đầu tiên không phải là "dùng framework gì" mà là "dữ liệu nằm ở đâu".

## Bài toán thật sự

Một blog cá nhân có đặc điểm rất khác một hệ thống SaaS:

- **Một người viết**, nhiều người đọc — write hiếm, read nhiều.
- Dữ liệu nhỏ: vài trăm bài viết là nhiều.
- Chạy trên một máy duy nhất, thường là localhost hoặc một VPS nhỏ.

Với đặc điểm đó, việc dựng một Postgres server riêng giống như thuê xe container để chở một thùng mì.

## SQLite giải quyết thế nào

\`\`\`ts
const db = new Database("data/blog.db");
db.pragma("journal_mode = WAL");
\`\`\`

Hai dòng. Không connection string, không Docker, không migration tool phức tạp. WAL mode cho phép đọc song song trong khi ghi — quá đủ cho tải của một blog.

> SQLite không phải là bản "đồ chơi" của database. Nó là database được deploy nhiều nhất thế giới — trong điện thoại của bạn, trình duyệt của bạn, và máy bay bạn đang ngồi.

## Khi nào KHÔNG nên dùng

- Nhiều process ghi đồng thời từ nhiều máy.
- Dữ liệu lớn hơn RAM nhiều lần và cần query phân tán.
- Cần replication tức thời.

Blog cá nhân không rơi vào trường hợp nào ở trên. Chọn công cụ theo bài toán, đừng chọn theo trend.`,
      },
      {
        title: "Viết mỗi ngày: thí nghiệm 100 ngày của tôi",
        slug: "viet-moi-ngay-thi-nghiem-100-ngay",
        excerpt:
          "Tôi đã thử viết ít nhất 200 chữ mỗi ngày trong 100 ngày liên tục. Đây là những gì thay đổi — và những gì không.",
        cover_image: null,
        featured: 0,
        category_id: catIds["cuoc-song"],
        tags: ["viet-lach", "nang-suat"],
        published_at: daysAgo(10),
        content: `Ngày thứ nhất, tôi viết 200 chữ về... việc không biết viết gì. Ngày thứ 100, tôi có một kho 40.000 chữ và một thói quen không muốn bỏ.

## Luật chơi

1. Tối thiểu 200 chữ, không giới hạn trên.
2. Viết gì cũng được — nhật ký, ghi chú kỹ thuật, thư không gửi.
3. Không sửa trong lúc viết. Sửa là việc của ngày hôm sau.

## Điều thay đổi

**Suy nghĩ rõ hơn.** Nhiều vấn đề tưởng là hiểu rồi, đến khi viết ra mới thấy lỗ hổng. Viết là debug cho tư duy.

**Bớt sợ trang giấy trắng.** Sau 100 ngày, "bắt đầu viết" không còn là nghi lễ. Mở file, gõ. Thế thôi.

## Điều KHÔNG thay đổi

Chất lượng bản nháp đầu vẫn tệ. Khác biệt là giờ tôi biết bản nháp đầu *được phép* tệ.

Nếu bạn định thử: đừng đặt mục tiêu "viết hay". Đặt mục tiêu "viết đủ 200 chữ". Số lượng sẽ tự dẫn đến chất lượng.`,
      },
      {
        title: "App Router của Next.js: những điều tôi ước ai đó nói với mình sớm hơn",
        slug: "nextjs-app-router-nhung-dieu-toi-uoc-biet-som-hon",
        excerpt:
          "Server Components mặc định, caching nhiều tầng, và ranh giới client/server — ba thứ khiến người mới dễ vấp nhất khi chuyển sang App Router.",
        cover_image: null,
        featured: 0,
        category_id: catIds["lap-trinh"],
        tags: ["nextjs", "typescript"],
        published_at: daysAgo(17),
        content: `Chuyển từ Pages Router sang App Router giống như chuyển từ lái xe số sàn sang xe điện: nhiều thứ tự động hơn, nhưng mô hình tư duy phải thay đổi hẳn.

## 1. Mặc định là Server Component

Mọi component trong \`app/\` chạy trên server trừ khi bạn khai báo \`"use client"\`. Điều này nghĩa là:

\`\`\`tsx
// Hoàn toàn hợp lệ trong Server Component:
export default async function Page() {
  const posts = db.prepare("SELECT * FROM posts").all();
  return <PostList posts={posts} />;
}
\`\`\`

Truy vấn database *ngay trong component*. Không cần API route trung gian cho trang public.

## 2. Ranh giới client/server là ranh giới serialize

Props truyền từ Server Component sang Client Component phải serialize được. Function, class instance, Date — không qua được biên giới.

## 3. Cache nhiều tầng

Next.js cache ở 4 tầng khác nhau. Khi dữ liệu "không chịu cập nhật", 90% là do một tầng cache nào đó. Học \`revalidatePath\` và \`dynamic = "force-dynamic"\` trước khi học bất cứ thứ gì khác.

Kết luận: App Router đáng học, nhưng hãy học *mô hình* trước khi học API.`,
      },
      {
        title: "Sản phẩm tốt bắt đầu từ một câu hỏi đúng",
        slug: "san-pham-tot-bat-dau-tu-mot-cau-hoi-dung",
        excerpt:
          "Trước khi hỏi 'xây cái gì', hãy hỏi 'ai đau ở đâu'. Ghi chép từ một lần làm hỏng sản phẩm vì bỏ qua bước này.",
        cover_image: null,
        featured: 0,
        category_id: catIds["san-pham"],
        tags: ["ux", "nang-suat"],
        published_at: daysAgo(24),
        content: `Năm ngoái tôi dành ba tháng xây một công cụ không ai dùng. Bài học đắt nhất không nằm ở code.

## Sai lầm: bắt đầu từ giải pháp

Tôi thấy một công nghệ hay, nghĩ ra một sản phẩm dùng công nghệ đó, rồi mới đi tìm người dùng. Thứ tự này ngược hoàn toàn.

## Câu hỏi đúng

- Ai là người dùng? (một người cụ thể, không phải "mọi người")
- Họ đang đau ở đâu, và họ đang giải quyết nỗi đau đó bằng cách nào?
- Cách hiện tại của họ tệ đến mức nào — đủ tệ để họ đổi thói quen không?

Nếu không trả lời được câu thứ ba, sản phẩm sẽ rơi vào vùng "hay đấy, nhưng thôi".

## Áp dụng vào blog này

Ngay cả một blog cá nhân cũng là sản phẩm. Người dùng là *tôi-của-tương-lai* — người sẽ tìm lại những ghi chép cũ. Nên tính năng quan trọng nhất không phải là giao diện đẹp, mà là **tìm kiếm tốt** và **cấu trúc phân loại rõ ràng**.`,
      },
      {
        title: "Đọc 'Thinking, Fast and Slow': hệ thống 1 đang viết code của bạn",
        slug: "doc-thinking-fast-and-slow-he-thong-1-dang-viet-code",
        excerpt:
          "Kahneman không viết cho lập trình viên, nhưng cuốn sách giải thích chính xác vì sao ta tự tin merge một PR có bug.",
        cover_image: null,
        featured: 0,
        category_id: catIds["doc-va-nghi"],
        tags: ["sach"],
        published_at: daysAgo(31),
        content: `Hệ thống 1 nghĩ nhanh, tự động, và rất tự tin. Hệ thống 2 nghĩ chậm, tốn sức, và lười. Vấn đề: code review là việc của hệ thống 2, nhưng ta thường làm nó bằng hệ thống 1.

## "Nhìn qua có vẻ ổn"

Khi review một đoạn code *trông giống* pattern quen thuộc, hệ thống 1 lập tức kết luận "ổn" — và hệ thống 2 chẳng buồn kiểm tra. Đó là lý do bug ẩn trong những đoạn code trông bình thường nhất.

## WYSIATI — What You See Is All There Is

Kahneman gọi đây là thiên kiến nguy hiểm nhất: ta xây kết luận chỉ từ thông tin đang thấy. Trong lập trình, đó là lúc ta sửa bug ở nơi có triệu chứng thay vì nơi có nguyên nhân.

## Ứng dụng thực tế

1. Checklist khi review — ép hệ thống 2 vào cuộc.
2. Nghỉ trước khi merge việc quan trọng. Mệt = hệ thống 2 tắt.
3. Viết test *trước* khi tin rằng code đúng, vì sau khi thấy code chạy, não sẽ tự bịa lý do vì sao nó đúng.

Một cuốn sách tâm lý học hoá ra lại là tài liệu kỹ thuật phần mềm hạng nhất.`,
      },
      {
        title: "TypeScript strict mode: đau một lần, khoẻ mãi mãi",
        slug: "typescript-strict-mode-dau-mot-lan-khoe-mai-mai",
        excerpt:
          "Bật strict mode giống như đi khám răng định kỳ — khó chịu lúc đầu nhưng rẻ hơn nhiều so với chữa sâu răng.",
        cover_image: null,
        featured: 0,
        category_id: catIds["lap-trinh"],
        tags: ["typescript"],
        published_at: daysAgo(40),
        content: `\`"strict": true\` là dòng config có tỷ suất lợi nhuận cao nhất trong toàn bộ tsconfig.

## strictNullChecks đáng giá nhất

Trước strict mode, \`null\` và \`undefined\` gán được vào mọi type — nghĩa là type system đang nói dối bạn.

\`\`\`ts
function len(s: string) { return s.length; }
len(null); // không strict: compile OK, runtime nổ
\`\`\`

## Chi phí thật

Bật strict trên codebase cũ sẽ ra hàng trăm lỗi. Đừng sửa tất cả một lúc — dùng chiến thuật:

1. Bật strict, đánh dấu lỗi cũ bằng \`// @ts-expect-error TODO\`.
2. Luật mới: file nào chạm vào thì phải sạch lỗi.
3. Mỗi tuần trả nợ một ít.

Sau ba tháng, codebase của team tôi sạch hoàn toàn — và số bug production liên quan đến null giảm về gần 0.`,
      },
      {
        title: "Một buổi sáng không điện thoại",
        slug: "mot-buoi-sang-khong-dien-thoai",
        excerpt:
          "Thí nghiệm nhỏ: để điện thoại ở phòng khác cho đến 9 giờ sáng. Kết quả làm tôi ngạc nhiên.",
        cover_image: null,
        featured: 0,
        category_id: catIds["cuoc-song"],
        tags: ["nang-suat"],
        published_at: daysAgo(50),
        content: `Buổi sáng của tôi từng bắt đầu bằng 40 phút cuộn màn hình trong chăn. Tuần trước, tôi thử một luật duy nhất: điện thoại ngủ ở phòng khách.

## Ba điều xảy ra

**Thứ nhất**, tôi thức dậy nhanh hơn. Hoá ra thứ giữ tôi trên giường không phải cơn buồn ngủ mà là cái màn hình.

**Thứ hai**, ý tưởng quay lại. Khoảng trống 30 phút buổi sáng — lúc pha cà phê, lúc nhìn ra cửa sổ — là lúc những suy nghĩ tự sắp xếp. Bài blog này được nghĩ ra trong một buổi sáng như thế.

**Thứ ba**, tôi nhận ra phần lớn "việc khẩn" lúc 7 giờ sáng... vẫn khẩn y nguyên lúc 9 giờ. Không thứ gì cháy cả.

Không phải lời khuyên sống chậm sáo rỗng — chỉ là một thí nghiệm nhỏ, chi phí bằng 0, và bạn có thể thử ngay sáng mai.`,
      },
      {
        title: "Ghi chú: thiết kế hệ thống phân quyền đơn giản mà đúng",
        slug: "ghi-chu-thiet-ke-he-thong-phan-quyen-don-gian",
        excerpt:
          "Bản nháp về cách chọn giữa RBAC, ABAC và một bảng permissions thủ công cho dự án nhỏ.",
        cover_image: null,
        featured: 0,
        category_id: catIds["lap-trinh"],
        tags: ["kien-truc"],
        published_at: null, // draft — demo cho trạng thái bản nháp trong admin
        content: `(Bản nháp — đang viết)

## Câu hỏi

Dự án nhỏ có cần RBAC đầy đủ không, hay một cột \`role\` là đủ?

## Ý chính định viết

- Bắt đầu từ use case, không phải từ framework.
- Một cột role đủ cho 90% dự án nội bộ.
- Thời điểm *phải* nâng cấp: khi xuất hiện yêu cầu "quyền theo từng bản ghi".`,
      },
    ];

    for (const p of posts) {
      const words = p.content.split(/\s+/).length;
      const r = insPost.run({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        cover_image: p.cover_image,
        status: p.published_at ? "published" : "draft",
        featured: p.featured,
        category_id: p.category_id,
        views: 0,
        reading_minutes: Math.max(1, Math.round(words / 200)),
        published_at: p.published_at ?? daysAgo(1),
      });
      const postId = Number(r.lastInsertRowid);
      for (const t of p.tags) insPostTag.run(postId, tagIds[t]);
    }

    // Deterministic pseudo-random view history for the last 45 days so the
    // dashboard chart has data on first run.
    const insView = db.prepare(
      "INSERT INTO post_views (post_id, date, count) VALUES (?, ?, ?)"
    );
    const updPostViews = db.prepare("UPDATE posts SET views = views + ? WHERE id = ?");
    const published = db
      .prepare("SELECT id, published_at FROM posts WHERE status = 'published'")
      .all() as { id: number; published_at: string }[];
    for (const post of published) {
      for (let d = 45; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const day = date.toISOString().slice(0, 10);
        if (day < post.published_at.slice(0, 10)) continue;
        // simple hash → stable "random" 0..24 with weekly rhythm
        const seed = (post.id * 31 + d * 7) % 17;
        const weekend = [0, 6].includes(date.getDay()) ? 4 : 0;
        const count = 3 + (seed % 9) + weekend + (post.id === 1 ? 6 : 0);
        insView.run(post.id, day, count);
        updPostViews.run(count, post.id);
      }
    }

    const insComment = db.prepare(
      "INSERT INTO comments (post_id, author_name, content, status, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    insComment.run(1, "Minh Trần", "Bài viết rất thực tế! Mình cũng vừa chuyển blog sang SQLite, backup giờ chỉ là một lệnh rsync.", "approved", daysAgo(2));
    insComment.run(1, "Hà Linh", "Cho mình hỏi WAL mode có cần cấu hình gì thêm khi deploy lên VPS không?", "approved", daysAgo(1));
    insComment.run(2, "Tuấn Anh", "Đang ở ngày 12 của thử thách viết. Đúng là bản nháp đầu vẫn tệ thật :))", "approved", daysAgo(8));
    insComment.run(3, "khách ẩn danh", "check out my site >>> http://spam.example.com", "spam", daysAgo(5));
    insComment.run(4, "Phương Vy", "Câu 'ai đau ở đâu' đúng quá. Team mình vừa pivot sau khi phỏng vấn 10 người dùng đầu tiên.", "pending", daysAgo(0));
  });

  tx();
}
