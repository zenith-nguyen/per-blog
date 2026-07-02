// Reset the database. The schema + seed data live in src/lib/db.ts and run
// automatically on the next server start, so "reseeding" = deleting the file.
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
let removed = false;
for (const f of ["blog.db", "blog.db-wal", "blog.db-shm", "blog.db-journal"]) {
  const p = path.join(dataDir, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    removed = true;
  }
}
console.log(
  removed
    ? "✓ Đã xoá database. Khởi động lại server (npm run dev) để tạo lại dữ liệu mẫu."
    : "Database chưa tồn tại — sẽ được tạo khi chạy npm run dev."
);
