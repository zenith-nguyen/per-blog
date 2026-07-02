# Tài liệu nghiệp vụ — Mực & Giấy

## 1. Tổng quan sản phẩm

**Mực & Giấy** là nền tảng blog cá nhân tự vận hành (self-hosted). Sản phẩm phục vụ **một tác giả duy nhất** muốn sở hữu hoàn toàn nội dung và dữ liệu của mình, kèm công cụ quản trị đủ dùng mà không cần dịch vụ bên thứ ba.

### Bài toán
- Các nền tảng blog (Medium, Substack…) sở hữu dữ liệu và kiểm soát phân phối.
- WordPress quá nặng cho nhu cầu một người viết; SaaS headless CMS phát sinh chi phí định kỳ.
- Người viết cần: viết nhanh bằng Markdown, phân loại rõ ràng, biết bài nào được đọc, và kiểm soát bình luận.

### Giải pháp
Một ứng dụng duy nhất, một file database, chạy được trên máy cá nhân hoặc VPS nhỏ. Không tài khoản bên ngoài, không phí định kỳ, backup = copy 1 file.

## 2. Đối tượng sử dụng (personas)

| Persona | Mô tả | Nhu cầu chính |
|---|---|---|
| **Tác giả (Admin)** | Chủ blog, người duy nhất có tài khoản | Viết/sửa/đăng bài, xem báo cáo lượt đọc, duyệt bình luận, tuỳ chỉnh thông tin blog |
| **Độc giả** | Khách truy cập, không cần tài khoản | Đọc bài, tìm kiếm, lọc theo chủ đề, bình luận |

## 3. Khái niệm nghiệp vụ (domain)

| Khái niệm | Định nghĩa | Quy tắc |
|---|---|---|
| **Bài viết (Post)** | Đơn vị nội dung chính, viết bằng Markdown | Có 2 trạng thái: `draft` (nháp) và `published` (đã đăng). Chỉ bài `published` xuất hiện trên site public. |
| **Slug** | Định danh URL của bài (`/blog/<slug>`) | Duy nhất toàn hệ thống; tự sinh từ tiêu đề (bỏ dấu tiếng Việt); có thể sửa tay. |
| **Chuyên mục (Category)** | Phân loại chính, cấu trúc | Mỗi bài thuộc **tối đa 1** chuyên mục. Xoá chuyên mục → bài trở thành "Chưa phân loại" (không xoá bài). |
| **Thẻ (Tag)** | Nhãn tự do | Mỗi bài gắn **0..n** thẻ. Xoá thẻ chỉ gỡ liên kết. |
| **Bài nổi bật (Featured)** | Cờ đánh dấu | Bài nổi bật mới nhất chiếm vị trí hero ở trang chủ. |
| **Bình luận (Comment)** | Phản hồi của độc giả | Sinh ra ở trạng thái `pending`; chỉ hiển thị public khi admin duyệt (`approved`); có thể đánh dấu `spam`. |
| **Lượt xem (View)** | Đơn vị đo lường độc giả | Đếm 1 lần/bài/phiên trình duyệt (dedupe bằng sessionStorage). Lưu cả tổng và theo ngày. |
| **Cài đặt (Settings)** | Thông tin toàn cục | Tên blog, mô tả, tác giả, mạng xã hội, số bài/trang. |

## 4. Luồng nghiệp vụ chính

### 4.1 Vòng đời bài viết

```
[Viết mới] ──"Lưu nháp"──▶ (draft) ──"Đăng bài"──▶ (published)
                              ▲                        │
                              └──────"Lưu nháp"────────┘   (gỡ xuống, giữ published_at)
Xoá được ở mọi trạng thái (xoá cứng, kèm xác nhận).
```

Quy tắc:
- `published_at` được đóng dấu ở **lần đăng đầu tiên** và không đổi khi cập nhật sau đó (giữ đúng thứ tự thời gian).
- `reading_minutes` tự tính lại mỗi lần lưu (~200 từ/phút).
- Đổi status về `draft` khiến bài biến mất khỏi site public ngay lập tức (mọi trang public đều dynamic).

### 4.2 Kiểm duyệt bình luận

```
Độc giả gửi ──▶ (pending) ──duyệt──▶ (approved: hiện public)
                   │  ▲                    │
                   └──┼────đánh dấu────▶ (spam: ẩn)
                      └── mọi trạng thái đều chuyển đổi được; xoá vĩnh viễn cần xác nhận
```

Lý do thiết kế *duyệt-trước*: blog cá nhân không có đội moderation; mặc định an toàn hơn mặc định mở.

### 4.3 Báo cáo (report)

Dashboard trả lời 3 câu hỏi của tác giả:
1. **Blog có đang được đọc không?** → tổng lượt xem + biểu đồ 30 ngày.
2. **Bài nào đáng viết tiếp?** → top 5 bài được đọc nhiều.
3. **Có gì cần xử lý không?** → số bình luận chờ duyệt, số bản nháp.

## 5. Yêu cầu phi chức năng đã định nghĩa

| Hạng mục | Mục tiêu | Cách đạt |
|---|---|---|
| Hiệu năng | Trang public render < 100ms trên localhost | SQLite synchronous + Server Components, không API round-trip cho trang public |
| Responsive | Dùng tốt từ 375px đến desktop | Mobile-first Tailwind; admin sidebar tự chuyển thanh ngang trên mobile |
| Cá nhân hoá | Giao diện sáng/tối theo lựa chọn người đọc | Toggle + localStorage + `prefers-color-scheme`, áp trước paint (không flash) |
| Truy cập (a11y) | Điều hướng bàn phím, label đầy đủ | aria-label các nút icon, label gắn input, `prefers-reduced-motion` |
| An toàn dữ liệu | Không mất bài khi thao tác nhầm | Xoá luôn có confirm; backup = copy `data/blog.db` |

## 6. Phạm vi & giới hạn (đã chốt)

**Trong phạm vi:** một tác giả, chạy localhost/VPS đơn, tiếng Việt là ngôn ngữ chính.

**Ngoài phạm vi (có thể mở rộng sau):**
- Nhiều tác giả / phân quyền — cần thêm cột role + sanitize markdown.
- Upload ảnh (hiện dùng URL ảnh ngoài).
- RSS feed, sitemap tự động, full-text search có xếp hạng (hiện dùng LIKE).
- Gửi email thông báo bình luận mới.
