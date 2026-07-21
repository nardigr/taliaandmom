import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getCurrentAdminProfile } from "@/lib/admin/profile-actions";
import { getLogoUrl } from "@/lib/settings";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [admin, logoUrl] = await Promise.all([
    getCurrentAdminProfile(),
    getLogoUrl(),
  ]);

  return (
    <div className="min-h-screen bg-ivory lg:flex">
      <AdminSidebar adminName={admin?.name} logoUrl={logoUrl} />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
