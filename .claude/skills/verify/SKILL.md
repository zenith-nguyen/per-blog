---
name: verify
description: Quy trình kiểm tra bắt buộc trước khi kết thúc bất kỳ task nào trên per-blog — type-check, build, boot server và smoke test các trang chính. Dùng khi vừa code xong một tính năng, trước khi commit/push, hoặc khi người dùng yêu cầu "kiểm tra lại".
---

# Verify — kiểm tra trước khi kết thúc task

Chạy đủ 4 bước theo thứ tự. Bước nào fail thì DỪNG, sửa xong chạy lại từ bước đó.

## 1. Type-check

```bash
npx tsc --noEmit
```

Phải sạch 100%. Không được dùng `@ts-ignore` để lách.

## 2. Build production

```bash
npm run build
```

Lưu ý: nếu dev server đang chạy, dừng nó trước (build và dev dùng chung `.next/`).

## 3. Boot + smoke test

```bash
npm run dev &
sleep 6
curl -s -o /dev/null -w "home: %{http_code}\n"  localhost:3000/
curl -s -o /dev/null -w "blog: %{http_code}\n"  localhost:3000/blog
curl -s -o /dev/null -w "auth-guard: %{http_code}\n" localhost:3000/api/admin/stats   # phải là 401
```

Kỳ vọng: `200 / 200 / 401`. Nếu task chạm vào API nào thì curl thêm endpoint đó (mẫu trong `docs/API.md` mục 7).

## 4. Kiểm tra bằng mắt (nếu task có UI)

- Mở trang bị ảnh hưởng ở **cả light lẫn dark mode** (toggle trên header).
- Thu viewport về **375px** kiểm tra mobile.
- Đối chiếu checklist cuối `docs/DESIGN-GUIDE.md` (mục 9).

## Sau khi pass

- Nếu đổi API/DB/nghiệp vụ → cập nhật docs tương ứng **trong cùng commit**.
- Commit message tiếng Anh, giải thích "tại sao". KHÔNG thêm trailer Co-Authored-By.
- Push thẳng `main`. CI trên GitHub Actions phải xanh (tab Actions).
