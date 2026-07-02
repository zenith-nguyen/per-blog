---
name: add-feature
description: Scaffold đúng chuẩn khi thêm tính năng mới cho per-blog — trang public, trang admin, API resource, hoặc bảng/cột database. Dùng khi người dùng yêu cầu thêm màn hình, endpoint, entity hoặc tính năng mới bất kỳ.
---

# Add Feature — scaffold theo chuẩn per-blog

Đọc `docs/AI-GUIDE.md` (luật) + `docs/DESIGN-GUIDE.md` (UI) trước. Sau đó chọn đúng recipe:

## Recipe A — Trang public mới

1. Tạo `src/app/(site)/<đường-dẫn>/page.tsx` (tự có Header/Footer từ layout nhóm).
2. Server Component; đọc dữ liệu bằng cách gọi hàm `src/lib/repo.ts` TRỰC TIẾP (không fetch API).
3. Thêm `export const dynamic = "force-dynamic"` + `metadata`/`generateMetadata`.
4. UI theo DESIGN-GUIDE: container `max-w-6xl px-5` (trang đọc: `max-w-3xl`), heading `font-display`, animation `rise rise-1..`.

## Recipe B — Trang admin mới

1. Tạo `src/app/admin/(panel)/<tên>/page.tsx` — nằm trong `(panel)` là tự có auth guard + sidebar.
2. Client component (`"use client"`), fetch dữ liệu qua `/api/admin/*`, có state `loading` và hiển thị lỗi từ `data.message`.
3. Thêm mục menu vào mảng `ITEMS` trong `src/components/admin/AdminNav.tsx`.
4. Mọi text tiếng Việt; thao tác xoá phải `confirm()` nêu rõ hậu quả.

## Recipe C — API resource mới

1. Query mới → viết hàm trong `src/lib/repo.ts` (KHÔNG viết SQL ở route).
2. Route: copy cấu trúc `src/app/api/admin/tags/route.ts` (GET list + POST) và `tags/[id]/route.ts` (thao tác theo id).
3. Mở đầu mỗi handler:
   ```ts
   try { await requireAuth(); } catch (r) { return r as Response; }
   ```
   (bỏ qua CHỈ khi endpoint public có chủ đích — hiện chỉ có login, views, comments).
4. Lỗi trả `{ error: "MÃ_HOA", message: "tiếng Việt" }` + status 400/401/404/409 đúng nghĩa.
5. Cập nhật `docs/API.md` cùng commit.

## Recipe D — Bảng / cột database mới

1. Sửa `migrate()` trong `src/lib/db.ts`:
   - Bảng mới: thêm `CREATE TABLE IF NOT EXISTS` (khai báo FK + `ON DELETE ...` rõ ràng).
   - Cột mới: `ALTER TABLE ... ADD COLUMN` bọc try/catch (SQLite không có IF NOT EXISTS cho cột).
2. Cập nhật type ở `src/lib/types.ts`, hàm ở `repo.ts`, seed nếu cần dữ liệu mẫu.
3. Cập nhật `docs/DATABASE.md` cùng commit.
4. Nếu đổi seed: nhắc người dùng `npm run db:seed` + restart server (connection cache trong globalThis).

## Kết thúc

Luôn chạy skill **verify** trước khi báo xong.
