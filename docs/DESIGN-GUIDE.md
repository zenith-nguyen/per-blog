# Design Guide — UI/UX, Theme & Format của Mực & Giấy

> Quy chuẩn thiết kế cho MỌI thay đổi giao diện. Mục tiêu: người dùng không phân biệt được
> phần nào code trước, phần nào code sau — tất cả phải như một bàn tay thiết kế.

## 1. Khái niệm thiết kế (design concept)

**"Mực navy trên giấy"** — thẩm mỹ editorial/tạp chí in:
- Cảm giác **tờ báo được sắp chữ cẩn thận**: đường kẻ (rule), số thứ tự, chữ hoa cách rộng, serif lớn.
- **Phẳng và sắc**: không bo góc (trừ admin nav), không shadow, không gradient nền. Phân tách bằng **border**, không bằng đổ bóng.
- Trang trí tiết chế: texture giấy (grain overlay), drop cap chữ đầu bài, ký hiệu `§` trước heading, fleuron `❦` thay `<hr>`.

Khi thêm UI mới, tự hỏi: *"cái này trông có giống được in trên giấy không?"* — nếu trông như dashboard SaaS bóng bẩy thì đang sai hướng.

## 2. Màu — CHỈ dùng token, cấm hardcode hex

Nguồn duy nhất: `@theme` trong `src/app/globals.css`.

| Token | Light | Vai trò |
|---|---|---|
| `paper` | `#f4f6fa` | Nền trang |
| `paper-warm` | `#e9eef6` | Nền panel/card (admin box, form login) |
| `paper-deep` | `#dbe3f0` | Nền inline-code |
| `ink` | `#0e1626` | Chữ chính, heading, nút chính |
| `ink-soft` | `#33415c` | Chữ đoạn văn |
| `ink-faint` | `#66748f` | Chữ phụ: meta, ngày, placeholder |
| `accent` | `#2457a8` | Điểm nhấn DUY NHẤT: link hover, CTA, badge, số thứ tự, trạng thái cần chú ý |
| `accent-deep` | `#163a75` | Hover của nút accent |
| `night` / `night-soft` / `night-line` | `#0a111f` / `#101a2c` / `#223049` | Dark mode: nền / panel / viền |
| `cream` / `cream-faint` | `#dbe4f2` / `#8fa0bc` | Dark mode: chữ chính / chữ phụ |

**Quy tắc:**
- Trong `.dark`, `--color-accent` tự đổi thành `#6f9de4` (sáng hơn để đủ tương phản trên nền navy đen). Vì vậy **không bao giờ hardcode hex** — kể cả trong SVG (dùng `var(--color-accent)`).
- Accent dùng **tiết kiệm** — mỗi khung nhìn chỉ nên có 1–2 mảng accent lớn. Nhấn tất cả = không nhấn gì.
- Viền: light dùng `border-ink/10` (nhẹ) `border-ink/15` (panel) `border-ink/20` (input) `border-ink/80` hoặc `border-t-2` (đường kẻ đậm kiểu báo); dark tương ứng `border-cream/10..25`.
- Mọi element có màu phải khai báo **cả hai theme** (`text-ink dark:text-paper`…). Không được để class màu thiếu vế dark.

## 3. Typography

| Font | Token | Dùng cho |
|---|---|---|
| **Fraunces** (serif) | `font-display` | Heading, tiêu đề bài, logo, số liệu lớn ở dashboard |
| **Be Vietnam Pro** | mặc định body | Đoạn văn, UI chung |
| **JetBrains Mono** | `font-mono` | Slug, số đếm, ngày ở meta, code, badge trạng thái, tag `#slug` |

**Thang chữ đang dùng (giữ nguyên nhịp):**
- Hero H1: `text-5xl md:text-7xl font-display font-semibold tracking-tight leading-[1.05]`
- H1 trang: `text-4xl`–`text-5xl font-display font-semibold`
- Tiêu đề card: `text-2xl font-display font-semibold leading-snug`
- Section heading: `text-xl`–`text-2xl font-display font-semibold`
- Body: `text-sm`–`text-base leading-relaxed`
- **Label/eyebrow**: `text-xs uppercase tracking-[0.14em]` (form label, cột bảng) hoặc `tracking-[0.3em]` + accent (eyebrow trên heading). Đây là chữ ký của theme — label mới PHẢI theo format này.
- Logo/wordmark luôn kèm dấu chấm accent: `Mực & Giấy<span class="text-accent">.</span>`

**Nội dung bài viết** (markdown render): dùng class `prose-ink` — đã có sẵn drop cap, `§` heading, bullet gạch ngang `—`, blockquote serif nghiêng, fleuron. Style nội dung bài CHỈ sửa trong block `.prose-ink` ở globals.css.

## 4. Chuyển động (motion)

- **Vào trang**: animation `rise-in` (trồi lên 18px + fade, cubic-bezier(0.22,1,0.36,1), 0.7s) với stagger `.rise .rise-1..5` — chỉ áp cho khối lớn khi trang load, không áp cho list item lẻ.
- **Hover**: transition màu 0.2–0.3s; các hiệu ứng đặc trưng đang dùng:
  - Link chữ: `link-sweep` (gạch chân chạy từ trái sang)
  - Tiêu đề card: gạch chân accent sweep bằng `bg-[length:0%_2px] → group-hover:bg-[length:100%_2px]`
  - Mũi tên `⟶` dịch phải `group-hover:translate-x-1.5`
  - Theme toggle xoay nhẹ `hover:rotate-12`
- **Cấm**: bounce, pulse vô hạn, parallax, animation dài >1s. Mọi motion phải tắt được — đã có `@media (prefers-reduced-motion: reduce)`, motion mới phải nằm trong quy tắc này.
- Chuyển theme sáng/tối có transition 0.35s trên background/color (đã cài ở body).

## 5. Component patterns (nhìn theo mẫu có sẵn)

| Cần làm | Mẫu chuẩn |
|---|---|
| Card bài viết | `PostCard.tsx` — mở đầu bằng `border-t-2` đậm, meta 2 đầu, số thứ tự mono `01` |
| Nút chính (CTA) | Nền `bg-accent text-paper hover:bg-accent-deep`, KHÔNG bo góc, padding `px-5 py-2.5`, chữ `text-sm font-medium` |
| Nút phụ | `border border-ink/25 hover:border-accent` nền trong suốt |
| Nút nguy hiểm (xoá) | Chữ `text-ink-faint hover:text-accent` dạng link, LUÔN kèm `confirm()` mô tả rõ hậu quả |
| Input/textarea/select | `border border-ink/20 bg-transparent px-3 py-2.5 text-sm focus:border-accent` — focus đổi màu viền, không ring |
| Label form | `text-xs uppercase tracking-[0.14em] text-ink-faint` |
| Badge trạng thái | `font-mono text-[11px] px-2 py-0.5` — pending: `bg-accent/15 text-accent`; approved: `bg-ink/10`; spam: thêm `line-through` |
| Panel/box | `border border-ink/15 bg-paper-warm p-5` (dark: `border-cream/15 bg-night-soft`) |
| Filter tabs | Dãy nút `border px-4 py-2 text-xs`, active = `border-accent bg-accent text-paper` |
| Bảng dữ liệu | Header `uppercase tracking-[0.14em] text-xs` + `border-b-2` đậm; hàng `border-b border-ink/10`; số căn phải + mono |
| Empty state | Câu tiếng Việt thân thiện + link hành động, KHÔNG icon minh hoạ to |
| Loading | Chữ "Đang tải…" giản dị — không spinner, không skeleton |

## 6. Layout & responsive

- Container: public `max-w-6xl px-5`; trang đọc bài `max-w-3xl` (độ rộng đọc thoải mái); admin `max-w-5xl`, form `max-w-2xl`.
- Breakpoint chính: `sm` (2 cột card), `md` (nav desktop, admin sidebar dọc), `lg` (3 cột, layout 2 cột chính-phụ `lg:grid-cols-[2fr_1fr]`).
- Mobile-first: viết class không prefix cho mobile trước, thêm `md:`/`lg:` sau. Test ở 375px.
- Admin sidebar: desktop dọc trái `w-60`, mobile tự thành thanh ngang cuộn được (đã xử lý trong `AdminNav`) — thêm mục menu là tự tương thích.
- Header public sticky + `backdrop-blur`; không thêm sticky element khác cạnh tranh với nó.

## 7. Format nội dung & dữ liệu

- **Ngày**: `toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })` → "29 tháng 6, 2026". Dùng hàm `formatDate` trong `PostCard.tsx`, đừng viết lại.
- **Số**: `toLocaleString("vi-VN")` → `1.405`. Số thứ tự trong list: mono, pad 2 chữ số `01, 02…`.
- **Datetime trong DB**: UTC, format `YYYY-MM-DD HH:MM:SS`; parse phía client bằng `new Date(s.replace(" ", "T"))`.
- **Mũi tên**: dùng `⟶` (đi tới) và `⟵` (quay lại) — không dùng `->` hay icon library.
- **Ký tự trang trí**: `·` ngăn cách meta, `§` heading bài viết, `❦` thay hr, `#slug` cho tag.
- **Tiếng Việt**: mọi chuỗi UI có dấu đầy đủ, xưng "bạn", thông báo lỗi nói cách khắc phục ("Vui lòng nhập tên…") thay vì mã lỗi.

## 8. Accessibility — chuẩn tối thiểu bắt buộc

- Nút chỉ có icon → phải có `aria-label` tiếng Việt (xem ThemeToggle, nút xoá tag).
- Input phải có `<label htmlFor>` — không dùng placeholder thay label (trừ input tìm kiếm có `aria-label`).
- Ảnh/SVG có nghĩa → `role="img"` + `aria-label` (xem ViewsChart); trang trí → `aria-hidden`.
- Màu chữ trên nền phải đạt tương phản AA — đặc biệt chú ý khi dùng `accent` trong dark mode (lý do có override `#6f9de4`).
- Điều hướng được bằng bàn phím: không xoá outline mà không thay bằng focus style khác (input đã dùng `focus:border-accent`).

## 9. Checklist review UI trước khi xong việc

- [ ] Nhìn đúng "chất báo in" — border thay shadow, phẳng, sắc?
- [ ] Đủ cả light + dark mode, không mảng nào bị "quên dark:"?
- [ ] Chạy thử 375px — không tràn ngang, nút bấm được bằng ngón tay?
- [ ] Text tiếng Việt có dấu, ngày/số format vi-VN?
- [ ] Label uppercase tracking, số dùng mono, heading dùng font-display?
- [ ] Màu lấy từ token, không có hex lạ trong component?
- [ ] Có aria-label/label cho control mới? Motion nằm trong prefers-reduced-motion?
