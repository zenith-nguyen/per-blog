# Mực & Giấy — hướng dẫn cho AI coding assistant

Blog cá nhân tiếng Việt + admin CMS. Next.js 15 App Router, TypeScript strict, Tailwind v4, SQLite (better-sqlite3). Một tiến trình, một file DB (`data/blog.db`, tự seed lần chạy đầu).

**BẮT BUỘC đọc trước khi code: [docs/AI-GUIDE.md](docs/AI-GUIDE.md)** — luật kiến trúc, quy tắc nghiệp vụ, các bẫy đã gặp, pattern chuẩn.
**Trước khi sửa bất kỳ UI nào: [docs/DESIGN-GUIDE.md](docs/DESIGN-GUIDE.md)** — theme navy/giấy, token màu, typography, component pattern, format vi-VN.

## Lệnh

```bash
npm run dev          # dev server :3000 (KHÔNG dùng npm --prefix — cwd phải là thư mục repo)
npx tsc --noEmit     # type-check — phải sạch trước khi kết thúc task
npm run build        # build production — phải pass trước khi push
npm run db:seed      # reset DB (xoá file; server tự seed lại — nhớ restart server)
```

## Luật tóm tắt (chi tiết trong AI-GUIDE)

- Mọi SQL chỉ nằm trong `src/lib/repo.ts`. Public page đọc repo trực tiếp; admin UI đi qua `/api/admin/*`.
- API admin luôn `requireAuth()`; lỗi trả `{ error: "MÃ", message: "tiếng Việt" }` + đúng HTTP status.
- Không thêm dependency mới nếu không thật sự cần. Không sanitize markdown (single-author, cố ý).
- UI text 100% tiếng Việt; màu chỉ dùng token trong `globals.css` (cấm hardcode hex); mọi element phải có cả light + dark mode.
- Biến font next/font phải ở `<html>` (không chuyển xuống body). Không export helper từ `route.ts`.
- Đổi API/DB/nghiệp vụ → cập nhật docs tương ứng cùng commit. Push thẳng `main`, không PR, không trailer Co-Authored-By.
