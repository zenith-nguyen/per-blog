# Tổng quan nền tảng — Mực & Giấy

> Tài liệu "một trang biết hết": nền tảng là gì, dùng công nghệ gì, nghiệp vụ ra sao, các phần kết nối với nhau thế nào, trang admin có gì và dùng như thế nào. Chi tiết sâu hơn xem các tài liệu chuyên đề được link ở cuối mỗi mục.

---

## 1. Nền tảng này là gì?

**Mực & Giấy** là nền tảng blog cá nhân **tự vận hành, không phụ thuộc dịch vụ ngoài**:

- 🌐 **Website public** — nơi độc giả đọc bài, tìm kiếm, lọc theo chủ đề, bình luận.
- 🛠 **Trang quản trị (Admin CMS)** — nơi tác giả viết bài, xem báo cáo lượt đọc, duyệt bình luận, cấu hình blog.
- 🗄 **Một file dữ liệu duy nhất** (`data/blog.db`) — backup bằng một lệnh copy.

Tất cả chạy trong **một tiến trình Next.js** trên localhost (hoặc một VPS nhỏ). Không cần cài database server, không cần tài khoản SaaS, không có chi phí định kỳ.

**Triết lý thiết kế:** chọn công cụ theo bài toán. Blog một người viết không cần Postgres, không cần microservice, không cần chart library 300KB — nhưng cần cấu trúc dữ liệu rõ ràng, UX mượt và tài liệu đầy đủ.

---

## 2. Công nghệ

| Tầng | Công nghệ | Vai trò |
|---|---|---|
| Framework | **Next.js 15** (App Router) + **React 19** | Full-stack: SSR trang public, client component cho admin, REST API |
| Ngôn ngữ | **TypeScript** (strict mode) | An toàn kiểu toàn dự án, type domain dùng chung client/server |
| Styling | **Tailwind CSS v4** | Design tokens tại một nơi (`@theme`), dark mode bằng class |
| Database | **SQLite** qua `better-sqlite3` (WAL mode) | Lưu trữ nhúng, API đồng bộ, không cần server |
| Nội dung | **Markdown** qua `marked` | Bài viết lưu markdown nguồn, render lúc đọc |
| Font | **Fraunces** + **Be Vietnam Pro** + **JetBrains Mono** | Hỗ trợ tiếng Việt đầy đủ, load qua `next/font` (self-host, không FOUT) |
| Auth | Cookie phiên httpOnly + **scrypt** (Node built-in) | Không JWT, không dependency thêm, thu hồi phiên được |
| CI/CD | **GitHub Actions** (`.github/workflows/ci.yml`) | Mỗi lần push `main`: type-check → build → smoke test server |

**Bảng màu "navy & đen":** light mode = mực navy trên giấy trắng lạnh; dark mode = nền navy gần đen (`#0a111f`) với accent xanh sáng. Toàn bộ nằm trong `src/app/globals.css`, đổi 1 chỗ là đổi cả app.

→ Chi tiết kiến trúc & lý do từng quyết định: **[ARCHITECTURE.md](ARCHITECTURE.md)**

---

## 3. Nghiệp vụ

Hai vai trò: **Tác giả** (một người, có tài khoản) và **Độc giả** (không cần tài khoản).

**Các thực thể chính:**

```
Chuyên mục (1) ──< Bài viết >──< Thẻ          Bài viết: draft → published
                      │                        Slug duy nhất, tự sinh tiếng Việt không dấu
                      ├──< Bình luận           Bình luận: pending → approved / spam
                      └──< Lượt xem theo ngày  Đếm 1 lần/bài/phiên trình duyệt
```

**Quy tắc nghiệp vụ quan trọng:**
- Chỉ bài `published` xuất hiện public; chuyển về `draft` = gỡ bài ngay lập tức.
- `published_at` đóng dấu **lần đăng đầu tiên**, không đổi khi sửa (giữ đúng dòng thời gian).
- Bình luận **luôn phải duyệt** trước khi hiện — mặc định an toàn cho blog không có đội moderation.
- Xoá chuyên mục không xoá bài (bài thành "Chưa phân loại"); xoá bài là vĩnh viễn (có confirm).

→ Personas, luồng nghiệp vụ đầy đủ, phạm vi & giới hạn: **[BUSINESS.md](BUSINESS.md)**

---

## 4. Kỹ thuật & Kết nối giữa các phần

Sơ đồ luồng dữ liệu:

```
Độc giả ──▶ Trang public (Server Components)
                 │  gọi hàm TRỰC TIẾP (không qua HTTP)
                 ▼
            src/lib/repo.ts  ◀── TOÀN BỘ SQL nằm ở đây
                 ▼
            src/lib/db.ts ──▶ data/blog.db (SQLite, WAL)
                 ▲
            REST API (/api/*)
                 ▲  fetch + cookie phiên
Tác giả ──▶ Admin UI (Client Components)
```

**3 kênh kết nối:**

1. **Public → dữ liệu:** Server Component đọc thẳng `repo.ts` — không API round-trip, trang render một lượt trên server (nhanh + SEO tốt).
2. **Admin → dữ liệu:** luôn đi qua REST API (`/api/admin/*`). Mỗi route gọi `requireAuth()` kiểm tra cookie phiên trước khi chạm DB. Nhờ vậy API vừa là backend của admin UI, vừa dùng được từ bên ngoài (curl, script, app khác).
3. **Độc giả → tương tác:** 2 endpoint public duy nhất — `POST /api/views` (đếm lượt xem, dedupe phía client) và `POST /api/comments` (gửi bình luận vào hàng chờ duyệt).

**Bảo mật phân lớp:** guard ở layout admin (redirect về login) **và** ở từng API route (401) — UI bị bypass thì API vẫn chặn. Mật khẩu hash scrypt; cookie httpOnly nên JS không đọc trộm được.

→ Đặc tả từng endpoint + cURL mẫu: **[API.md](API.md)** · Schema 8 bảng + quan hệ: **[DATABASE.md](DATABASE.md)**

---

## 5. Trang Admin có gì?

Truy cập `http://localhost:3000/admin` (link "Quản trị" ở chân trang blog):

| Màn hình | Chức năng |
|---|---|
| **Tổng quan** | Báo cáo: 3 thẻ số liệu (bài viết / lượt xem / bình luận), biểu đồ lượt xem 30 ngày, top 5 bài được đọc, bình luận mới nhất |
| **Bài viết** | Danh sách toàn bộ bài (lọc trạng thái, tìm kiếm), sửa/xoá/xem nhanh |
| **Editor** | Viết Markdown 2 tab (Viết / Xem trước), tự sinh slug, đếm từ + thời gian đọc, chọn chuyên mục & thẻ, ảnh bìa, Lưu nháp / Đăng bài, đánh dấu nổi bật |
| **Chuyên mục & Thẻ** | Thêm/xoá, hiển thị số bài của từng mục |
| **Bình luận** | Lọc theo trạng thái; Duyệt / Chờ / Spam / Xoá vĩnh viễn |
| **Cài đặt** | Tên blog, khẩu hiệu, mô tả SEO, thông tin tác giả, link mạng xã hội, số bài mỗi trang — áp dụng ngay khi lưu |

Đăng nhập bằng **email + mật khẩu quản trị** (khai báo trong seed `src/lib/db.ts`). Phiên giữ 7 ngày.

→ Hướng dẫn từng bước cho người không kỹ thuật (kèm FAQ): **[ADMIN-GUIDE.md](ADMIN-GUIDE.md)**

---

## 6. Cách sử dụng

### Chạy lần đầu
```bash
git clone git@github.com:zenith-nguyen/per-blog.git
cd per-blog
npm install
npm run dev          # → http://localhost:3000
```
Lần chạy đầu tự tạo `data/blog.db` kèm dữ liệu mẫu (8 bài viết, lượt xem 45 ngày, bình luận đủ 3 trạng thái) để khám phá ngay.

### Quy trình viết bài hằng ngày
1. Vào `/admin` → đăng nhập.
2. **+ Viết bài mới** → viết Markdown → chọn chuyên mục/thẻ → **Đăng bài** (hoặc **Lưu nháp** viết tiếp sau).
3. Xem **Tổng quan** để biết bài nào đang được đọc; duyệt bình luận mới nếu có.

### Vận hành
| Việc | Cách làm |
|---|---|
| Chạy production | `npm run build && npm start` |
| Backup | copy file `data/blog.db` (dừng server hoặc copy kèm `-wal`) |
| Reset về dữ liệu mẫu | `npm run db:seed` rồi chạy lại server |
| Đổi mật khẩu | sửa `hashPassword(...)` trong seed `src/lib/db.ts` + `npm run db:seed` (mất dữ liệu) — hoặc update thẳng bảng `users` để giữ dữ liệu |
| CI | GitHub Actions tự chạy type-check + build + smoke test mỗi lần push `main` |

### Mở rộng trong tương lai (đã chừa sẵn đường)
- Upload ảnh (hiện dùng URL ngoài) · RSS/sitemap · full-text search có xếp hạng · nhiều tác giả (cần thêm sanitize markdown + cột role) · đổi mật khẩu trong UI.
