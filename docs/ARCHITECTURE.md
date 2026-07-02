# Kiến trúc & Logic code — Mực & Giấy

## 1. Tổng quan kiến trúc

Ứng dụng **full-stack một tiến trình** trên Next.js 15 App Router:

```
┌────────────────────────── Next.js process ──────────────────────────┐
│                                                                      │
│  Trang public (Server Components) ──────────┐                        │
│      /, /blog, /blog/[slug], /category…     │  gọi hàm trực tiếp     │
│                                             ▼                        │
│  Admin UI (Client Components) ──fetch──▶ REST API ──▶ repo.ts ──▶ db.ts ──▶ SQLite
│      /admin/*                        /api/admin/*    (toàn bộ SQL)   (schema+seed)
│                                                                      │
│  Tương tác public (view count, comment) ──fetch──▶ /api/views, /api/comments
└──────────────────────────────────────────────────────────────────────┘
```

**Nguyên tắc phân tầng:**
1. **Trang public đọc dữ liệu trực tiếp** qua `repo.ts` trong Server Component — không đi qua HTTP, nhanh nhất có thể.
2. **Admin UI luôn đi qua REST API** — để mọi thao tác ghi được kiểm tra auth tập trung, và API được "tập thể dục" thường xuyên (chính admin là client đầu tiên của API).
3. **Mọi SQL nằm trong `src/lib/repo.ts`** — page/route không viết SQL. Muốn biết app đọc ghi gì, đọc một file duy nhất.

## 2. Cấu trúc thư mục chi tiết

```
src/
├── lib/
│   ├── db.ts          # Kết nối SQLite (singleton qua globalThis), schema CREATE TABLE,
│   │                  # seed dữ liệu mẫu lần chạy đầu, hash/verify mật khẩu (scrypt)
│   ├── repo.ts        # Repository: toàn bộ truy vấn (list/get/create/update/delete,
│   │                  # thống kê dashboard, ghi lượt xem)
│   ├── auth.ts        # Phiên đăng nhập: login/logout/getSessionUser/requireAuth
│   ├── markdown.ts    # renderMarkdown (marked), readingMinutes, slugify tiếng Việt
│   ├── validate.ts    # parsePostInput — validate payload editor (dùng chung POST/PUT)
│   └── types.ts       # Type domain dùng chung client/server
├── components/
│   ├── Header.tsx / Footer.tsx / ThemeToggle.tsx   # khung site public
│   ├── PostCard.tsx        # card bài viết + formatDate
│   ├── ViewTracker.tsx     # client: POST /api/views 1 lần/phiên
│   ├── CommentSection.tsx  # client: hiển thị + form gửi bình luận
│   └── admin/
│       ├── AdminNav.tsx    # sidebar điều hướng + logout
│       ├── PostEditor.tsx  # editor Markdown 2 tab (viết/xem trước), sidebar xuất bản
│       └── ViewsChart.tsx  # biểu đồ SVG thuần, render server
└── app/
    ├── layout.tsx          # font (Fraunces/Be Vietnam Pro/JetBrains Mono, subset vietnamese),
    │                       # script chống flash dark-mode, metadata từ settings
    ├── globals.css         # design tokens (@theme), dark variant, prose styles, animation
    ├── (site)/             # route group public — có Header/Footer riêng
    ├── admin/
    │   ├── login/          # ngoài vùng bảo vệ
    │   └── (panel)/        # layout GUARD: getSessionUser() → redirect /admin/login
    └── api/                # route handlers (xem docs/API.md)
```

## 3. Các quyết định thiết kế & lý do

| Quyết định | Lý do |
|---|---|
| **SQLite + better-sqlite3 (sync)** | Blog cá nhân: read-heavy, 1 process. API đồng bộ đơn giản hoá code (không await), WAL mode cho phép đọc song song. Backup = copy file. |
| **Không ORM** | Schema nhỏ (8 bảng), SQL thuần trong repo.ts dễ đọc hơn và là tài liệu sống. |
| **Session token trong DB, cookie httpOnly** | Đơn giản, thu hồi được (logout xoá row), không cần secret quản lý JWT. |
| **scrypt (Node built-in)** | Không thêm dependency bcrypt native; scrypt là KDF chuẩn, đủ mạnh. |
| **Guard admin ở layout, không dùng middleware** | Edge middleware không chạy được better-sqlite3. Guard tại `admin/(panel)/layout.tsx` + `requireAuth()` ở từng API route (phòng thủ 2 lớp). |
| **Trang public `force-dynamic`** | Nội dung thay đổi ngay khi admin bấm lưu, lượt xem luôn mới. Với SQLite localhost, SSR mỗi request vẫn ~vài ms. |
| **Markdown render không sanitize** | Người viết duy nhất là admin đã đăng nhập (trusted). Bình luận độc giả KHÔNG render markdown — React escape mặc định. Mở rộng multi-user thì thêm DOMPurify. |
| **Biểu đồ SVG tự viết** | Tránh 300KB chart library cho 1 đường line 30 điểm; render được từ server. |
| **Seed nằm trong db.ts** | "Empty DB → seed" chạy mọi nơi app khởi động; script seed chỉ cần xoá file. |

## 4. Luồng dữ liệu tiêu biểu

### Độc giả mở một bài viết
1. `GET /blog/[slug]` → Server Component gọi `getPostBySlug` + `getRelatedPosts` + `listApprovedComments` (3 query sync).
2. `renderMarkdown()` chuyển markdown → HTML trên server, trả về HTML hoàn chỉnh (SEO tốt, không JS blocking).
3. Trên client, `ViewTracker` mount → nếu `sessionStorage` chưa có key → `POST /api/views` → `recordView()` upsert `post_views(post_id, date)` và tăng `posts.views`.

### Admin đăng một bài mới
1. `PostEditor` (client) giữ toàn bộ state form; slug tự sinh từ tiêu đề đến khi người dùng sửa tay (`slugTouched`).
2. Bấm "Đăng bài" → `POST /api/admin/posts` với payload JSON.
3. Route handler: `requireAuth()` → `parsePostInput()` (validate + slugify) → check `slugExists` (409 nếu trùng) → `createPost()` trong **transaction** (insert post + post_tags).
4. Client `router.push("/admin/posts")` + `router.refresh()`.

### Đăng nhập
1. `POST /api/auth/login` → `login()` verify scrypt → tạo token 32-byte random → insert `sessions` (hạn 7 ngày) → set cookie `blog_session` (httpOnly, sameSite=lax).
2. Mỗi request admin: `getSessionUser()` join `sessions ⋈ users` kiểm tra hạn.

## 5. Theming & design system

- Token màu định nghĩa một nơi tại `@theme` trong `globals.css` — palette **navy trên giấy lạnh**: paper/ink/accent + biến thể night cho dark. Riêng `--color-accent` được override sáng hơn trong `.dark` để giữ độ tương phản trên nền navy-đen.
- Dark mode: class `dark` trên `<html>`, đặt **trước first paint** bằng inline script đọc localStorage → không flash.
- Font biến CSS (`--font-fraunces`…) phải gắn trên `<html>` (không phải body) để Tailwind `@theme` resolve được tại `:root`.
- Chuyển động: keyframe `rise-in` với stagger class `.rise-1..5`; tắt hoàn toàn khi `prefers-reduced-motion`.

## 6. Xử lý lỗi & quy ước

- API lỗi trả JSON thống nhất: `{ error: "MÃ_LỖI", message: "thông điệp tiếng Việt cho UI" }` + HTTP status đúng nghĩa (400/401/404/409).
- `requireAuth()` **throw** một `Response` 401 — route handler bắt bằng `try/catch` và return luôn, tránh lặp code guard.
- Client hiển thị `message` trực tiếp cho người dùng; không nuốt lỗi im lặng.

## 7. Kiểm thử & vận hành

- Smoke test thủ công: xem `docs/API.md` mục "cURL mẫu".
- Reset dữ liệu: `npm run db:seed` (xoá `data/blog.db*`; server tự seed lại lần chạy sau).
- Backup: copy `data/blog.db` (khi server đang chạy, nên copy cả `-wal` hoặc dừng server).
