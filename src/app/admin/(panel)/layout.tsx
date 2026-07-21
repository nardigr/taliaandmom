import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getCurrentAdminProfile } from "@/lib/admin/profile-actions";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdminProfile();

  return (
    <div className="min-h-screen bg-ivory lg:flex">
      <AdminSidebar adminName={admin?.name} />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
