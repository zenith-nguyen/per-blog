# Mực & Giấy — Blog cá nhân + CMS quản trị

Nền tảng blog cá nhân hoàn chỉnh chạy localhost: website public phong cách editorial (mực & giấy) và phần mềm quản trị (admin CMS) đi kèm. Toàn bộ chạy trên **một tiến trình Next.js + một file SQLite** — không cần cài database server.

## Khởi động nhanh

```bash
npm install          # cài dependencies (đã cấu hình sẵn trong .npmrc)
npm run dev          # chạy dev server tại http://localhost:3000
```

Lần chạy đầu tiên, database `data/blog.db` được tự tạo kèm **dữ liệu mẫu** (8 bài viết, chuyên mục, thẻ, bình luận, lịch sử lượt xem 45 ngày).

| Địa chỉ | Nội dung |
|---|---|
| `http://localhost:3000` | Website blog public |
| `http://localhost:3000/admin` | Phần mềm quản trị |

**Tài khoản admin:** cấu hình trong seed tại `src/lib/db.ts` (username là email của bạn) — đổi mật khẩu bằng cách sửa seed trong `src/lib/db.ts` rồi chạy `npm run db:seed` (xoá DB, tạo lại).

## Lệnh có sẵn

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` | Build production |
| `npm start` | Chạy bản production sau khi build |
| `npm run db:seed` | Reset database về dữ liệu mẫu (xoá `data/blog.db`, seed lại ở lần chạy sau) |

## Tính năng

**Website public**
- Trang chủ: hero, bài nổi bật, bài mới, chuyên mục, giới thiệu tác giả
- Danh sách bài viết: tìm kiếm full-text, lọc theo chuyên mục/thẻ, phân trang
- Chi tiết bài viết: render Markdown, thời gian đọc, đếm lượt xem, bài liên quan, bình luận (có kiểm duyệt)
- Dark mode (lưu lựa chọn, tôn trọng `prefers-color-scheme`), responsive đầy đủ, hiệu ứng chuyển động tôn trọng `prefers-reduced-motion`

**Admin CMS** (`/admin`)
- Đăng nhập phiên (cookie httpOnly, scrypt hash)
- **Tổng quan/Report**: tổng bài viết, lượt xem, biểu đồ lượt xem 30 ngày, top bài được đọc, bình luận mới
- **Bài viết**: CRUD đầy đủ, editor Markdown có xem trước, tự sinh slug tiếng Việt không dấu, đếm từ/thời gian đọc, trạng thái nháp/đã đăng, đánh dấu nổi bật
- **Chuyên mục & Thẻ**: thêm/xoá, đếm số bài
- **Bình luận**: duyệt / chờ / spam / xoá
- **Cài đặt**: tên blog, mô tả, thông tin tác giả, liên kết mạng xã hội, số bài mỗi trang

## Công nghệ

Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · SQLite (better-sqlite3, WAL mode) · marked (Markdown) · GitHub Actions CI (type-check + build + smoke test)

Font: **Fraunces** (display) + **Be Vietnam Pro** (body) + **JetBrains Mono** — đều hỗ trợ đầy đủ tiếng Việt.

## Tài liệu

| Tài liệu | Nội dung |
|---|---|
| [docs/OVERVIEW.md](docs/OVERVIEW.md) | **Đọc đầu tiên** — tổng quan nền tảng: công nghệ, nghiệp vụ, kết nối, admin, cách dùng |
| [docs/BUSINESS.md](docs/BUSINESS.md) | Nghiệp vụ: đối tượng, luồng công việc, quy tắc nghiệp vụ |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Kiến trúc code: cấu trúc thư mục, tầng, luồng dữ liệu, quyết định thiết kế |
| [docs/API.md](docs/API.md) | Đặc tả toàn bộ REST API (public + admin) |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema SQLite, quan hệ, index, quy ước |
| [docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md) | Hướng dẫn sử dụng phần mềm quản trị từng bước |
| [docs/DESIGN-GUIDE.md](docs/DESIGN-GUIDE.md) | Guideline UI/UX: theme, màu, typography, motion, component pattern, format |
| [docs/AI-GUIDE.md](docs/AI-GUIDE.md) | Kim chỉ nam cho AI/dev code tiếp: luật kiến trúc, quy ước, bẫy đã gặp (kèm `CLAUDE.md` ở gốc repo) |

## Cấu trúc thư mục (rút gọn)

```
per-blog/
├── data/blog.db            # SQLite database (tự tạo, không commit)
├── docs/                   # Tài liệu sản phẩm & kỹ thuật
├── scripts/seed.mjs        # Reset database
└── src/
    ├── lib/                # db, auth, repo (toàn bộ SQL), markdown, validate
    ├── components/         # UI components (public + admin)
    └── app/
        ├── (site)/         # Trang public: /, /blog, /category, /tag, /about
        ├── admin/          # CMS: login + (panel) dashboard/posts/taxonomy/comments/settings
        └── api/            # REST API: /api/auth, /api/views, /api/comments, /api/admin/*
```

## Ghi chú bảo mật

- Ứng dụng thiết kế để chạy **localhost / single-user**. Nội dung Markdown chỉ do admin (đã đăng nhập) nhập nên được render trực tiếp; nếu mở cho nhiều người viết, cần thêm sanitizer (vd. DOMPurify) trước khi render.
- Bình luận của khách được escape mặc định bởi React (không render HTML).
- Đổi mật khẩu mặc định trước khi đưa ra ngoài localhost.
