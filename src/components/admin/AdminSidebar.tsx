"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminSignOutAction } from "@/lib/admin/actions";
import { t } from "@/lib/i18n/sq";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: t.paneli, exact: true },
  { href: "/admin/produktet", label: t.produktet },
  { href: "/admin/koleksionet", label: t.koleksionet },
  { href: "/admin/porosite", label: t.porosite },
  { href: "/admin/klientet", label: t.klientet },
  { href: "/admin/epikoinonia", label: t.bisedat },
  { href: "/admin/faqet", label: t.faqet },
  { href: "/admin/seo", label: t.seo },
  { href: "/admin/statistika", label: t.statistika },
  { href: "/admin/profili", label: t.profili },
  { href: "/admin/cilesimet", label: t.cilesimet },
];

export function AdminSidebar({
  adminName,
}: {
  adminName?: string | null;
}) {
  const currentPath = usePathname() ?? "/admin";

  return (
    <aside className="flex w-full flex-col border-b border-beige bg-cream lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="border-b border-beige px-6 py-6">
        <Link href="/" className="font-display text-2xl text-choco">
          Talja&mom
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-choco-soft">
          Admin
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
        {links.map((link) => {
          const active = link.exact
            ? currentPath === link.href
            : currentPath === link.href || currentPath.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-choco text-ivory"
                  : "text-choco hover:bg-ivory",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-beige px-4 py-6">
        {adminName && (
          <p className="mb-3 px-4 text-sm font-medium text-choco">{adminName}</p>
        )}
        <form action={adminSignOutAction}>
          <button
            type="submit"
            className="w-full rounded-lg px-4 py-3 text-left text-sm text-choco transition-colors hover:bg-ivory"
          >
            {t.dil}
          </button>
        </form>
      </div>
    </aside>
  );
}
