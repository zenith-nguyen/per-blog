# AI Guide — Kim chỉ nam cho AI/dev code tiếp sản phẩm này

> Tài liệu này dành cho **AI coding assistant (hoặc dev mới)** tiếp tục phát triển Mực & Giấy.
> Đọc file này TRƯỚC KHI viết bất kỳ dòng code nào. Làm theo đúng các quy ước dưới đây
> để code mới không lệch hướng với code hiện có.

## 0. Đồ nghề có sẵn

Repo có **project skills** trong `.claude/skills/` (Claude Code tự nhận; AI khác đọc như tài liệu quy trình):
`verify` (kiểm tra trước khi xong task) · `add-feature` (recipe scaffold 4 loại) · `design-review` (soát UI theo theme) · `db-ops` (reset/backup/đổi mật khẩu DB). Kèm `.claude/settings.json` (allowlist lệnh an toàn) và `.claude/launch.json` (chạy dev server cho preview).

## 0b. Đọc gì trước khi làm gì

| Bạn định làm | Đọc trước |
|---|---|
| Bất cứ việc gì | File này + [OVERVIEW.md](OVERVIEW.md) |
| Thêm/sửa UI | [DESIGN-GUIDE.md](DESIGN-GUIDE.md) — bắt buộc, kể cả sửa 1 nút |
| Thêm/sửa API | [API.md](API.md) — giữ đúng quy ước response |
| Thêm/sửa bảng, cột, query | [DATABASE.md](DATABASE.md) + `src/lib/db.ts` |
| Thêm tính năng nghiệp vụ | [BUSINESS.md](BUSINESS.md) — kiểm tra không phá quy tắc nghiệp vụ |

## 1. Luật kiến trúc BẤT DI BẤT DỊCH

1. **Mọi SQL nằm trong `src/lib/repo.ts`.** Page, component, route handler KHÔNG BAO GIỜ viết SQL trực tiếp. Cần query mới → thêm hàm vào repo.ts.
2. **Trang public đọc dữ liệu trực tiếp** từ repo.ts trong Server Component (không fetch API nội bộ). **Admin UI luôn đi qua REST API** `/api/admin/*` bằng fetch.
3. **Mọi API route ghi dữ liệu phải gọi `requireAuth()`** (trừ 3 endpoint public: login, views, comments). Pattern chuẩn:
   ```ts
   try { await requireAuth(); } catch (r) { return r as Response; }
   ```
4. **Response lỗi thống nhất:** `{ error: "MÃ_HOA", message: "tiếng Việt cho UI" }` + đúng HTTP status (400/401/404/409). Client hiển thị `message` trực tiếp.
5. **Không thêm dependency nếu Node/Next/CSS làm được.** Đã cố tình KHÔNG dùng: ORM, chart library, bcrypt, JWT, sanitizer, UI kit. Muốn thêm package mới → phải có lý do trong commit message.
6. **Không dùng Next.js middleware cho auth** — edge runtime không chạy được better-sqlite3. Guard nằm ở `admin/(panel)/layout.tsx` + từng API route.
7. **TypeScript strict** — không `any`, không `@ts-ignore`. Type domain khai báo ở `src/lib/types.ts` và dùng chung client/server.

## 2. Quy tắc nghiệp vụ KHÔNG ĐƯỢC PHÁ

- Chỉ bài `status='published'` xuất hiện ở mọi bề mặt public (kể cả search, related, RSS sau này).
- `published_at` chỉ đóng dấu **một lần** ở lần đăng đầu — update sau không được ghi đè (xem `updatePost`).
- Bình luận mới **luôn** là `pending`; không bao giờ auto-approve.
- Xoá category → bài thành "Chưa phân loại" (`ON DELETE SET NULL`), KHÔNG xoá bài.
- Slug là duy nhất; sinh bằng `slugify()` (bỏ dấu tiếng Việt); trùng → trả 409, không tự thêm hậu tố.
- `reading_minutes` luôn tính lại server-side khi lưu (~200 từ/phút) — không tin giá trị client gửi lên.
- Lượt xem dedupe **phía client** bằng sessionStorage (1 lần/bài/phiên); server không chặn thêm.

## 3. Bẫy đã gặp — đừng dẫm lại

| Bẫy | Chi tiết |
|---|---|
| **Biến font next/font phải gắn trên `<html>`** | KHÔNG chuyển xuống `<body>`. Tailwind `@theme` emit `--font-*` tại `:root`; nếu biến của next/font nằm ở body thì resolve fail → toàn bộ font về mặc định. Đã dính 1 lần. |
| **`route.ts` chỉ được export HTTP method** | Không export helper từ route.ts (Next sẽ fail build). Helper dùng chung → đặt trong `src/lib/` (ví dụ `validate.ts`). |
| **Regex tiếng Việt phải dùng escape unicode** | Viết `/[̀-ͯ]/g` chứ đừng dán ký tự combining trực tiếp vào source — dễ vỡ khi qua tool/copy-paste. |
| **`slugify` tồn tại 2 bản** | `src/lib/markdown.ts` (server) và bản copy trong `PostEditor.tsx` (client — vì lib server import fs). Sửa logic slugify thì sửa CẢ HAI. |
| **`process.cwd()` quyết định vị trí DB** | Server phải chạy với cwd = thư mục repo. `npm --prefix` KHÔNG đổi cwd → DB sẽ tạo nhầm chỗ. Launch script phải `cd` thật. |
| **`.npmrc` có `legacy-peer-deps` + cache riêng** | Đừng xoá — máy owner có npm cache hỏng quyền root, và peer-deps của next/react cần flag này. |
| **DB singleton qua `globalThis`** | `getDb()` cache connection cho hot-reload. Sau khi chạy `npm run db:seed` (xoá file db) phải **restart server** — connection cũ trỏ vào file đã xoá. |
| **Đổi màu = đổi token, không đổi class** | Màu chỉ sống trong `@theme` ở `globals.css` (+ override `.dark`). Không hardcode hex trong component; SVG dùng `var(--color-accent)`. |

## 4. Pattern code chuẩn (copy khi thêm mới)

### Thêm một API admin resource mới
Xem `src/app/api/admin/tags/route.ts` (list + create) và `tags/[id]/route.ts` (delete) — copy đúng cấu trúc, đổi tên hàm repo.

### Thêm một trang admin mới
1. Tạo `src/app/admin/(panel)/<tên>/page.tsx` — nằm trong `(panel)` là tự có guard + sidebar.
2. Thêm mục vào mảng `ITEMS` trong `src/components/admin/AdminNav.tsx`.
3. Client component fetch API, state `loading/error`, mọi text tiếng Việt.

### Thêm một trang public mới
1. Tạo trong `src/app/(site)/` — tự có Header/Footer.
2. Server Component + gọi repo.ts trực tiếp + `export const dynamic = "force-dynamic"`.
3. Có `generateMetadata`/`metadata` cho SEO.

### Thêm cột/bảng mới
1. Sửa `migrate()` trong `db.ts` — dùng `CREATE TABLE IF NOT EXISTS` / với cột mới thì thêm `ALTER TABLE` có try/catch (SQLite không có IF NOT EXISTS cho cột).
2. Cập nhật type trong `types.ts`, query trong `repo.ts`, và **[DATABASE.md](DATABASE.md)**.

## 5. Ngôn ngữ & giọng điệu

- **Toàn bộ UI text là tiếng Việt** (có dấu đầy đủ) — nút, label, thông báo lỗi, empty state, confirm dialog.
- Code (tên biến, hàm, comment kỹ thuật) là **tiếng Anh**; comment giải thích nghiệp vụ có thể tiếng Việt.
- Ngày giờ hiển thị: `toLocaleDateString("vi-VN", …)`; số: `toLocaleString("vi-VN")` (1.405 chứ không phải 1,405).
- Giọng UI: thân thiện, ngắn gọn, không dùng thuật ngữ kỹ thuật với người dùng cuối (xem ADMIN-GUIDE làm mẫu).

## 6. Quy trình bắt buộc trước khi kết thúc một task

```bash
npx tsc --noEmit     # 1. type-check phải sạch
npm run build        # 2. build production phải pass
npm run dev          # 3. tự chạy và BẤM THỬ tính năng vừa làm (cả light + dark mode)
```
4. Nếu đổi API/DB/nghiệp vụ → **cập nhật docs tương ứng trong cùng commit** (API.md / DATABASE.md / BUSINESS.md). Docs lệch code = bug.
5. Nếu đổi UI → so với [DESIGN-GUIDE.md](DESIGN-GUIDE.md), chụp/kiểm tra cả 2 theme + mobile (375px).
6. Commit message tiếng Anh, mô tả "tại sao" chứ không chỉ "cái gì". KHÔNG thêm trailer Co-Authored-By AI (owner đã yêu cầu bỏ).
7. Push thẳng lên `main` (repo cá nhân, không dùng PR flow). CI trên GitHub Actions phải xanh.

## 7. Những thứ CỐ TÌNH không làm (đừng "sửa giúp")

- **Không sanitize markdown bài viết** — admin là người viết duy nhất (trusted). CHỈ thêm sanitizer nếu mở tính năng nhiều tác giả.
- **Bình luận là plain text** — render qua React escape, không markdown. Đừng "nâng cấp" thành rich text.
- **Không cache HTML đã render** — markdown render mỗi request, đủ nhanh với marked + SQLite localhost.
- **Không phân trang bằng cursor** — offset pagination đủ cho vài trăm bài.
- **Mật khẩu nằm trong seed** — đặc thù single-user localhost; đừng tự ý thêm flow email/reset password khi chưa được yêu cầu.
