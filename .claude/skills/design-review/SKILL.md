---
name: design-review
description: Review giao diện per-blog theo đúng design system "mực navy trên giấy" — chạy sau khi sửa bất kỳ UI nào, hoặc khi người dùng nói giao diện "nhìn sai sai", "không đồng bộ", "lệch theme".
---

# Design Review — soát UI theo design system

Chuẩn gốc: `docs/DESIGN-GUIDE.md`. Quét các file vừa thay đổi (git diff) theo thứ tự:

## 1. Quét vi phạm bằng lệnh

```bash
# Hex hardcode trong component (chỉ globals.css được chứa hex)
grep -rn "#[0-9a-fA-F]\{3,6\}" src/components src/app --include="*.tsx" | grep -v "var(--"

# Class màu thiếu vế dark (heuristic: text-ink/bg-paper không kèm dark: gần đó — soát tay từng chỗ)
grep -rn "text-ink\b\|bg-paper\b" src --include="*.tsx" | grep -v "dark:"

# Emoji/icon library lạ (theme chỉ dùng ký tự: ⟶ ⟵ · § ❦ ✎ ◫ ▦ ❖ ☰ ⚙ ☾ ☀ ✓ ⚠ ✕)
grep -rn "lucide\|react-icons\|heroicons" src package.json
```

## 2. Soát theo checklist (từng mục, không bỏ qua)

- **Chất liệu**: phẳng + sắc — border thay shadow, không bo góc (trừ admin nav), không gradient nền.
- **Màu**: chỉ token (`paper/ink/accent/night/cream` + biến thể); accent xuất hiện tiết chế (1–2 mảng/khung nhìn).
- **Chữ**: heading `font-display` (Fraunces); label `text-xs uppercase tracking-[0.14em]`; số & slug & badge dùng `font-mono`; logo có dấu chấm accent.
- **Motion**: chỉ `rise` khi load + hover transition ngắn; không animation vô hạn; nằm trong `prefers-reduced-motion`.
- **Format**: ngày `vi-VN` ("29 tháng 6, 2026"), số `1.405`, mũi tên `⟶`, số thứ tự `01` pad-2 mono.
- **A11y**: nút icon có `aria-label`; input có label; SVG có nghĩa có `role="img"`.

## 3. Kiểm tra trực quan

Mở từng trang bị ảnh hưởng: light mode → dark mode → viewport 375px. So sánh với các trang cũ cạnh bên — nếu phân biệt được "phần mới code" bằng mắt là FAIL.

## 4. Báo cáo

Liệt kê vi phạm theo mức: **phá theme** (sửa ngay) / **lệch chuẩn** (nên sửa) / **gợi ý**. Sửa xong chạy lại skill **verify**.
