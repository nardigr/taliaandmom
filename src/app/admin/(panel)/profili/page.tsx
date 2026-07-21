import { redirect } from "next/navigation";
import { AdminProfileForm } from "@/components/admin/AdminProfileForm";
import { AdminUsersManager } from "@/components/admin/AdminUsersManager";
import { listAdminUsers } from "@/lib/admin/admin-users-actions";
import { getCurrentAdminProfile } from "@/lib/admin/profile-actions";
import { t } from "@/lib/i18n/sq";

export default async function AdminProfilePage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) redirect("/admin/login");

  const admins = await listAdminUsers();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl text-choco">{t.profiliIm}</h1>
      <AdminProfileForm name={admin.name} email={admin.email} />
      <AdminUsersManager admins={admins} currentAdminId={admin.id} />
    </div>
  );
}
