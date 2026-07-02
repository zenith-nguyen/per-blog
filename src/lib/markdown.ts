import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: true });

/** Render trusted (admin-authored) markdown to HTML. */
export function renderMarkdown(md: string): string {
  return marked.parse(md) as string;
}

/** ~200 words/minute, floor at 1. */
export function readingMinutes(md: string): number {
  const words = md.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Vietnamese-aware slugify: "Vì sao tôi chọn SQLite" → "vi-sao-toi-chon-sqlite" */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
