# Hướng dẫn sử dụng phần mềm quản trị

Dành cho tác giả blog — không cần kiến thức kỹ thuật.

## 1. Đăng nhập

1. Mở `http://localhost:3000/admin` (hoặc bấm link **Quản trị** ở chân trang blog).
2. Nhập tài khoản — mặc định `admin` / `admin123`.
3. Phiên đăng nhập giữ 7 ngày; bấm **Đăng xuất** ở cuối sidebar khi dùng máy chung.

## 2. Màn hình Tổng quan (báo cáo)

Ngay sau đăng nhập bạn thấy:
- **3 thẻ số liệu**: tổng bài viết (kèm số nháp), tổng lượt xem (kèm 30 ngày gần nhất), bình luận (kèm số chờ duyệt).
- **Biểu đồ lượt xem 30 ngày** — nhìn nhịp độc giả theo ngày.
- **Bài được đọc nhiều** — gợi ý chủ đề nên viết tiếp.
- **Bình luận gần đây** — thấy ngay có gì cần duyệt.

## 3. Viết & quản lý bài viết

### Viết bài mới
1. Bấm **+ Viết bài mới** (có ở Tổng quan và trang Bài viết).
2. Nhập **Tiêu đề** — *slug (đường dẫn) tự sinh*, ví dụ "Vì sao tôi viết" → `/blog/vi-sao-toi-viet`. Bạn có thể sửa slug tay; sau khi sửa tay nó sẽ không tự đổi theo tiêu đề nữa.
3. Nhập **Mô tả ngắn** — hiện ở danh sách bài và kết quả tìm kiếm.
4. Viết nội dung bằng **Markdown** ở tab *Viết*; bấm tab *Xem trước* để xem đúng giao diện bài đăng. Góc phải hiển thị số từ và thời gian đọc ước tính.
5. Bên phải, chọn **Chuyên mục** (một), bấm chọn các **Thẻ** (nhiều), dán **URL ảnh bìa** nếu có.
6. Chọn một trong hai:
   - **Lưu nháp** — chỉ mình bạn thấy (trong admin).
   - **Đăng bài** — xuất hiện ngay trên blog.

> **Markdown tối thiểu cần nhớ:** `## Tiêu đề mục`, `**đậm**`, `*nghiêng*`, `` `code` ``, ```` ```khối code``` ````, `> trích dẫn`, `- gạch đầu dòng`, `[chữ](https://link)`.

### Sửa / gỡ / xoá
- Trang **Bài viết** liệt kê tất cả; lọc theo trạng thái, tìm theo từ khoá.
- **Sửa** → mở lại editor. Bấm **Lưu nháp** trên bài đã đăng = *gỡ bài xuống* (ngày đăng gốc được giữ khi đăng lại).
- **Xoá** là vĩnh viễn (kèm hộp xác nhận) — xoá cả bình luận và số liệu lượt xem của bài.

### Bài nổi bật
Tick **Đánh dấu nổi bật** trong editor — bài nổi bật mới nhất chiếm vị trí lớn trên trang chủ.

## 4. Chuyên mục & Thẻ

- **Chuyên mục** = ngăn kệ chính, mỗi bài nằm ở một ngăn (VD: Lập trình, Cuộc sống).
- **Thẻ** = nhãn dán tự do, một bài dán nhiều nhãn (VD: #typescript, #sach).
- Xoá chuyên mục **không xoá bài** — bài chuyển thành "Chưa phân loại". Xoá thẻ chỉ gỡ nhãn.

## 5. Duyệt bình luận

Bình luận độc giả **không hiện ngay** trên blog — chúng vào hàng **Chờ duyệt**:
- **✓ Duyệt** → hiện công khai dưới bài viết.
- **⚠ Spam** → ẩn, giữ lại để nhận diện mẫu spam.
- **Xoá vĩnh viễn** → mất hẳn.

Mẹo: số bình luận chờ duyệt luôn hiển thị ở thẻ "Bình luận" trong Tổng quan.

## 6. Cài đặt

Trang **Cài đặt** đổi được: tên blog, khẩu hiệu, mô tả, tên & giới thiệu tác giả, link GitHub/Twitter/email, số bài mỗi trang. Bấm **Lưu cài đặt** — thay đổi áp dụng ngay trên blog.

## 7. Câu hỏi thường gặp

**Đổi mật khẩu thế nào?** Hiện chưa có UI đổi mật khẩu. Cách làm: sửa mật khẩu seed trong `src/lib/db.ts` (dòng `hashPassword("admin123")`) rồi chạy `npm run db:seed` — *lưu ý lệnh này xoá toàn bộ dữ liệu*. Nếu muốn giữ dữ liệu, nhờ người kỹ thuật chạy update trực tiếp vào bảng `users`.

**Lỡ xoá bài quan trọng?** Không có thùng rác — hãy khôi phục từ file backup `data/blog.db` gần nhất. Nên backup định kỳ (copy 1 file duy nhất).

**Ảnh bài viết để đâu?** Phiên bản hiện tại dùng URL ảnh từ dịch vụ ngoài (Imgur, GitHub…). Upload ảnh trực tiếp nằm trong danh sách mở rộng.

**Blog chậm/không cập nhật?** Khởi động lại server: tắt terminal đang chạy rồi `npm run dev` lại.
