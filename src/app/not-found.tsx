import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-8xl font-semibold text-accent">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink dark:text-paper">
        Trang này chưa được viết.
      </h1>
      <p className="mt-3 max-w-md text-ink-soft dark:text-cream-faint">
        Có thể đường dẫn đã thay đổi, hoặc bài viết đã được gỡ xuống.
      </p>
      <Link
        href="/"
        className="mt-8 bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent dark:bg-paper dark:text-ink dark:hover:bg-accent dark:hover:text-paper"
      >
        ⟵ Về trang chủ
      </Link>
    </div>
  );
}
