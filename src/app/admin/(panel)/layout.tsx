import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quản trị" };

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminNav displayName={user.display_name} />
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
