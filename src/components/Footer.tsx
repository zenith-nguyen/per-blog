import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export default function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-ink/10 dark:border-cream/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-xl font-semibold text-ink dark:text-paper">
            {settings.site_title}
            <span className="text-vermilion">.</span>
          </p>
          <p className="mt-1 max-w-md text-sm text-ink-faint dark:text-cream-faint">
            {settings.site_tagline}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm text-ink-soft dark:text-cream-faint">
          {settings.social_github && (
            <a href={settings.social_github} className="link-sweep" target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {settings.social_email && (
            <a href={`mailto:${settings.social_email}`} className="link-sweep">
              Email
            </a>
          )}
          <Link href="/admin" className="link-sweep opacity-60">
            Quản trị
          </Link>
        </div>
      </div>
      <div className="border-t border-ink/10 py-4 text-center text-xs tracking-[0.2em] text-ink-faint uppercase dark:border-cream/10 dark:text-cream-faint">
        © {new Date().getFullYear()} {settings.author_name} · viết bằng mực, lưu bằng SQLite
      </div>
    </footer>
  );
}
