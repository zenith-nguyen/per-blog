import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/repo";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <Header siteTitle={settings.site_title} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
