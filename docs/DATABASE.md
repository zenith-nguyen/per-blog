# Thiết kế Database — Mực & Giấy

Engine: **SQLite 3** (file `data/blog.db`), truy cập qua `better-sqlite3`.
Cấu hình: `journal_mode = WAL` (đọc song song khi ghi), `foreign_keys = ON`.
Schema định nghĩa tại `src/lib/db.ts` (hàm `migrate`), chạy idempotent (`CREATE TABLE IF NOT EXISTS`) mỗi lần khởi động.

## Sơ đồ quan hệ

```
users 1───n sessions

categories 1───n posts n───n tags        (qua bảng nối post_tags)
                 │
                 ├──1───n comments
                 └──1───n post_views     (aggregate theo ngày)

settings (key-value, không quan hệ)
```

## Chi tiết bảng

### users — tài khoản quản trị
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | INTEGER PK | |
| username | TEXT UNIQUE | |
| password_hash | TEXT | định dạng `salt:hash` — scrypt(password, salt, 64 bytes), hex |
| display_name | TEXT | hiển thị trong admin |
| created_at | TEXT | `datetime('now')` — mọi thời gian trong DB là UTC, format `YYYY-MM-DD HH:MM:SS` |

### sessions — phiên đăng nhập
| Cột | Kiểu | Ghi chú |
|---|---|---|
| token | TEXT PK | 32 byte random hex — giá trị cookie `blog_session` |
| user_id | INTEGER FK → users | `ON DELETE CASCADE` |
| expires_at | TEXT | login + 7 ngày; hết hạn được dọn dần ở mỗi lần login |

### categories — chuyên mục
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | INTEGER PK | |
| name / slug | TEXT UNIQUE | slug sinh từ name (bỏ dấu tiếng Việt) |
| description | TEXT | hiển thị ở trang chuyên mục |

### tags — thẻ
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | INTEGER PK | |
| name / slug | TEXT UNIQUE | |

### posts — bài viết (bảng trung tâm)
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | INTEGER PK | |
| title | TEXT | |
| slug | TEXT UNIQUE | định danh URL `/blog/<slug>` |
| excerpt | TEXT | mô tả ngắn (danh sách + SEO) |
| content | TEXT | **Markdown nguồn** (render lúc đọc, không cache HTML) |
| cover_image | TEXT NULL | URL ảnh (tương lai: upload) |
| status | TEXT CHECK | `'draft'` \| `'published'` |
| featured | INTEGER 0/1 | bài nổi bật (hero trang chủ lấy bài featured mới nhất) |
| category_id | INTEGER FK NULL | `ON DELETE SET NULL` → "Chưa phân loại" |
| views | INTEGER | tổng lượt xem tích luỹ (denormalized để sort nhanh) |
| reading_minutes | INTEGER | tự tính khi lưu (~200 từ/phút) |
| published_at | TEXT NULL | đóng dấu **lần đăng đầu**, không đổi khi sửa |
| created_at / updated_at | TEXT | |

Index: `(status, published_at DESC)` cho danh sách public; `(category_id)` cho lọc.

### post_tags — quan hệ n-n
| Cột | Kiểu | Ghi chú |
|---|---|---|
| post_id | FK → posts | `ON DELETE CASCADE` |
| tag_id | FK → tags | `ON DELETE CASCADE` |
| | PK (post_id, tag_id) | |

### comments — bình luận độc giả
| Cột | Kiểu | Ghi chú |
|---|---|---|
| id | INTEGER PK | |
| post_id | FK → posts | `ON DELETE CASCADE` |
| author_name | TEXT | ≤ 80 ký tự (server cắt) |
| content | TEXT | ≤ 2000 ký tự; **plain text**, không render HTML/markdown |
| status | TEXT CHECK | `'pending'` (mặc định) \| `'approved'` \| `'spam'` |
| created_at | TEXT | |

Index: `(post_id, status)` — trang bài viết chỉ đọc approved của 1 bài.

### post_views — lượt xem theo ngày (nguồn cho biểu đồ)
| Cột | Kiểu | Ghi chú |
|---|---|---|
| post_id | FK → posts | `ON DELETE CASCADE` |
| date | TEXT | `YYYY-MM-DD` (UTC) |
| count | INTEGER | upsert `ON CONFLICT … DO UPDATE SET count = count + 1` |
| | PK (post_id, date) | |

Ghi chú thiết kế: giữ **cả** `posts.views` (tổng, sort top-posts O(1)) **và** `post_views` (chuỗi thời gian). Hai nguồn được ghi trong cùng một lượt gọi `recordView()`.

### settings — cấu hình key-value
| key | Ý nghĩa |
|---|---|
| site_title / site_tagline / site_description | nhận diện blog |
| author_name / author_bio | thông tin tác giả |
| social_github / social_twitter / social_email | liên kết |
| posts_per_page | số bài mỗi trang danh sách |

## Seed & Reset

- **Lần chạy đầu** (bảng `users` trống): tạo tài khoản admin (khai báo trong `src/lib/db.ts`), settings, 4 chuyên mục, 8 thẻ, 8 bài viết mẫu (7 published + 1 draft), 5 bình luận (đủ 3 trạng thái), và lịch sử lượt xem 45 ngày (giả lập deterministic — có nhịp cuối tuần).
- **Reset:** `npm run db:seed` xoá `data/blog.db*` → lần `npm run dev` kế tiếp seed lại.
- **Backup:** copy `data/blog.db` (nên dừng server hoặc copy kèm `-wal`).
