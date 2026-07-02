# Đặc tả REST API — Mực & Giấy

Base URL: `http://localhost:3000`. Tất cả request/response dùng JSON, UTF-8.

## Quy ước chung

**Response lỗi** (mọi endpoint):
```json
{ "error": "MÃ_LỖI", "message": "Thông điệp tiếng Việt hiển thị được cho người dùng" }
```

| HTTP | error | Khi nào |
|---|---|---|
| 400 | `VALIDATION` | Thiếu/sai định dạng dữ liệu |
| 401 | `UNAUTHORIZED` / `INVALID_CREDENTIALS` | Chưa đăng nhập / sai tài khoản |
| 404 | `NOT_FOUND` | Không tìm thấy bản ghi |
| 409 | `CONFLICT` | Trùng slug / trùng tên |

**Xác thực:** các endpoint `/api/admin/*` yêu cầu cookie phiên `blog_session` (nhận được từ login). Cookie httpOnly, SameSite=Lax, hạn 7 ngày.

---

## 1. Auth

### POST `/api/auth/login`
Body: `{ "username": "<email đăng nhập>", "password": "<mật khẩu>" }` — tài khoản khai báo trong seed (`src/lib/db.ts`).
- `200` → `{ "ok": true }` + Set-Cookie `blog_session`
- `401 INVALID_CREDENTIALS`

### POST `/api/auth/logout`
Xoá session hiện tại (DB + cookie). Luôn `200 { "ok": true }`.

---

## 2. Public

### POST `/api/views`
Ghi 1 lượt xem cho bài đã đăng. Client tự dedupe theo phiên trình duyệt.

Body: `{ "slug": "vi-sao-toi-chon-sqlite-cho-blog-ca-nhan" }`
- `200 { "ok": true }` (slug không tồn tại vẫn trả 200 — không tiết lộ tồn tại của bản nháp)

### POST `/api/comments`
Gửi bình luận — vào hàng chờ duyệt (`pending`).

Body: `{ "post_id": 1, "author_name": "Minh", "content": "Bài hay quá!" }`
- Giới hạn: `author_name` ≤ 80 ký tự, `content` ≤ 2000 ký tự (server tự cắt).
- `201 { "ok": true, "comment": {…} }` · `400 VALIDATION` · `404 NOT_FOUND` (bài không tồn tại/chưa đăng)

---

## 3. Admin — Bài viết

### GET `/api/admin/posts`
Query params:

| Param | Giá trị | Mặc định |
|---|---|---|
| `status` | `all` \| `published` \| `draft` | `all` |
| `search` | chuỗi tìm trong title/excerpt/content | — |
| `page`, `per_page` | phân trang | `1`, `20` |

→ `200 { "posts": Post[], "total": number }`

### POST `/api/admin/posts`
Tạo bài viết. Body (PostInput):
```json
{
  "title": "Tiêu đề",            // bắt buộc
  "content": "## Markdown…",     // bắt buộc
  "slug": "tuy-chon",            // tự sinh từ title nếu bỏ trống; tự slugify
  "excerpt": "Mô tả ngắn",
  "cover_image": "https://… | null",
  "status": "draft | published", // mặc định draft
  "featured": false,
  "category_id": 1,              // null = chưa phân loại
  "tag_ids": [1, 2]
}
```
- `201 { "post": Post }` · `400 VALIDATION` · `409 CONFLICT` (trùng slug)
- Server tự tính `reading_minutes`; `published_at` đóng dấu lần đăng đầu.

### GET `/api/admin/posts/:id` → `200 { "post": Post }` (kèm `tags`, `category_name`)
### PUT `/api/admin/posts/:id` — body như POST, thay toàn bộ (kể cả danh sách thẻ)
### DELETE `/api/admin/posts/:id` — xoá cứng (cascade post_tags, comments, post_views)

**Post object:**
```json
{
  "id": 1, "title": "…", "slug": "…", "excerpt": "…", "content": "markdown",
  "cover_image": null, "status": "published", "featured": 1,
  "category_id": 1, "category_name": "Lập trình", "category_slug": "lap-trinh",
  "views": 523, "reading_minutes": 3,
  "published_at": "2026-06-29 10:00:00", "created_at": "…", "updated_at": "…",
  "tags": [{ "id": 3, "name": "SQLite", "slug": "sqlite" }]
}
```

---

## 4. Admin — Chuyên mục & Thẻ

### GET `/api/admin/categories` → `{ "categories": [{…, "post_count": 4}] }`
### POST `/api/admin/categories` — body `{ "name": "Tên", "description": "…" }`, slug tự sinh → `201` / `409`
### DELETE `/api/admin/categories/:id` — bài trong chuyên mục chuyển thành chưa phân loại (`SET NULL`)

### GET `/api/admin/tags` → `{ "tags": [{…, "post_count": 2}] }`
### POST `/api/admin/tags` — body `{ "name": "Tên" }` → `201` / `409`
### DELETE `/api/admin/tags/:id` — gỡ thẻ khỏi mọi bài (cascade post_tags)

---

## 5. Admin — Bình luận

### GET `/api/admin/comments?status=all|pending|approved|spam`
→ `{ "comments": [{…, "post_title": "…", "post_slug": "…"}] }` (mới nhất trước)

### PATCH `/api/admin/comments/:id` — body `{ "status": "approved" | "pending" | "spam" }`
### DELETE `/api/admin/comments/:id` — xoá vĩnh viễn

---

## 6. Admin — Cài đặt & Báo cáo

### GET `/api/admin/settings` / PUT `/api/admin/settings`
Body PUT: bất kỳ tập con nào của các khoá (chỉ khoá hợp lệ được nhận):
`site_title, site_tagline, site_description, author_name, author_bio, social_github, social_twitter, social_email, posts_per_page`

### GET `/api/admin/stats`
```json
{
  "stats": {
    "totalPosts": 8, "publishedPosts": 7, "draftPosts": 1,
    "totalViews": 1405, "viewsLast30": 1197,
    "pendingComments": 1, "totalComments": 5,
    "viewsByDay": [{ "date": "2026-06-03", "count": 42 }, …],   // đủ 30 ngày, ngày trống = 0
    "topPosts": [{ "id": 1, "title": "…", "slug": "…", "views": 523 }],
    "recentComments": [Comment…]
  }
}
```

---

## 7. cURL mẫu (smoke test)

```bash
JAR=/tmp/blog-cookies.txt

# Đăng nhập, lưu cookie
curl -c $JAR -X POST localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' -d '{"username":"<email>","password":"<mật khẩu>"}'

# Tạo bài
curl -b $JAR -X POST localhost:3000/api/admin/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"Bài mới","content":"## Xin chào","status":"published"}'

# Báo cáo
curl -b $JAR localhost:3000/api/admin/stats

# Độc giả bình luận
curl -X POST localhost:3000/api/comments \
  -H 'Content-Type: application/json' \
  -d '{"post_id":1,"author_name":"Khách","content":"Hay!"}'
```
