---
name: db-ops
description: Thao tác database của per-blog — reset về dữ liệu mẫu, backup, xem dữ liệu, đổi mật khẩu admin giữ nguyên dữ liệu. Dùng khi người dùng muốn reset DB, backup, "mất dữ liệu", "quên mật khẩu", hoặc cần soi dữ liệu thật.
---

# DB Ops — thao tác database

DB là SQLite tại `data/blog.db` (WAL mode). Schema + seed: `src/lib/db.ts`.

## Reset về dữ liệu mẫu

```bash
npm run db:seed      # xoá data/blog.db* — KHÔNG hỏi lại, mất toàn bộ dữ liệu thật
# rồi RESTART server (bắt buộc — connection cũ cache trong globalThis trỏ vào file đã xoá)
```

⚠️ Trước khi chạy: hỏi người dùng có dữ liệu thật cần giữ không. Có → backup trước.

## Backup / Restore

```bash
# backup (nên dừng server, hoặc copy kèm -wal)
cp data/blog.db "backup-$(date +%Y%m%d-%H%M).db"
# restore
cp <file-backup>.db data/blog.db && rm -f data/blog.db-wal data/blog.db-shm
```

## Xem dữ liệu nhanh

```bash
sqlite3 data/blog.db ".tables"
sqlite3 data/blog.db "SELECT id, title, status, views FROM posts ORDER BY id;"
sqlite3 data/blog.db "SELECT id, author_name, status FROM comments;"
```

## Đổi mật khẩu admin mà KHÔNG mất dữ liệu

Hash bằng scrypt cùng format với `src/lib/db.ts` rồi update thẳng bảng users:

```bash
node -e '
const { scryptSync, randomBytes } = require("crypto");
const pw = process.argv[1];
const salt = randomBytes(16).toString("hex");
console.log(salt + ":" + scryptSync(pw, salt, 64).toString("hex"));
' 'MẬT_KHẨU_MỚI'

sqlite3 data/blog.db "UPDATE users SET password_hash='<kết quả ở trên>' WHERE id=1;"
```

Đổi luôn seed trong `src/lib/db.ts` để lần reset sau vẫn đúng mật khẩu mới. Nếu mật khẩu xuất hiện trong docs → thay bằng placeholder.

## Lưu ý cấu trúc

- Xoá post → cascade comments, post_tags, post_views. Xoá category → post thành NULL (không mất bài).
- `posts.views` (tổng) và `post_views` (theo ngày) phải được ghi CÙNG NHAU — chỉ qua `recordView()`.
- Mọi datetime là UTC `YYYY-MM-DD HH:MM:SS`.
