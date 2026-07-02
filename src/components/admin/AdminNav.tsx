"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Tổng quan", icon: "▦" },
  { href: "/admin/posts", label: "Bài viết", icon: "✎" },
  { href: "/admin/taxonomy", label: "Chuyên mục & Thẻ", icon: "❖" },
  { href: "/admin/comments", label: "Bình luận", icon: "☰" },
  { href: "/admin/settings", label: "Cài đặt", icon: "⚙" },
];

export default function AdminNav({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between bg-ink text-cream md:min-h-screen md:w-60 dark:bg-night-soft">
      <div>
        <div className="border-b border-cream/10 px-5 py-5">
          <Link href="/admin" className="font-display text-xl font-semibold text-paper">
            Mực & Giấy<span className="text-accent">.</span>
          </Link>
          <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-cream-faint uppercase">
            Bảng điều khiển
          </p>
        </div>
        <nav className="flex flex-row overflow-x-auto px-2 py-3 md:flex-col" aria-label="Điều hướng quản trị">
          {ITEMS.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-accent text-paper"
                    : "text-cream-faint hover:bg-cream/10 hover:text-paper"
                }`}
              >
                <span aria-hidden className="w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-cream/10 px-5 py-4">
        <p className="text-xs text-cream-faint">Đăng nhập: {displayName}</p>
        <div className="mt-2 flex items-center gap-4 text-xs">
          <Link href="/" className="link-sweep text-cream-faint hover:text-paper">
            ⟵ Xem blog
          </Link>
          <button onClick={handleLogout} className="link-sweep text-accent">
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
