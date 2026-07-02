"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/blog", label: "Bài viết" },
  { href: "/about", label: "Về tôi" },
];

export default function Header({ siteTitle }: { siteTitle: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md dark:border-cream/10 dark:bg-night/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tight text-ink dark:text-paper"
        >
          {siteTitle}
          <span className="text-vermilion">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Điều hướng chính">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`link-sweep text-sm font-medium uppercase tracking-[0.14em] ${
                  active ? "text-vermilion" : "text-ink-soft dark:text-cream-faint"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            aria-label="Mở menu"
            aria-expanded={open}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={`block h-0.5 w-5 bg-current transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span className={`block h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span
              className={`block h-0.5 w-5 bg-current transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-ink/10 px-5 py-4 md:hidden dark:border-cream/10"
          aria-label="Điều hướng di động"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 font-display text-xl text-ink dark:text-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
