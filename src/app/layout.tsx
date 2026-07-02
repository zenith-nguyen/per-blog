import type { Metadata } from "next";
import { Fraunces, Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { getSettings } from "@/lib/repo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600"],
  variable: "--font-jetbrains",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = getSettings();
  return {
    title: { default: s.site_title, template: `%s — ${s.site_title}` },
    description: s.site_description,
  };
}

// Applies saved theme before first paint to avoid a flash of wrong theme.
const themeScript = `
try {
  var t = localStorage.getItem("theme");
  if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${beVietnam.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="grain min-h-screen">
        {children}
      </body>
    </html>
  );
}
