"use client";

import { useEffect } from "react";

// Fire-and-forget view count. Dedupe per browser tab session so refreshing
// a post doesn't inflate numbers.
export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);
  return null;
}
