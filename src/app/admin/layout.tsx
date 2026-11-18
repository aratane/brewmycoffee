import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminMobileNav, AdminNav, AdminTopbar } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (["CUSTOMER", "BARISTA"].includes(session.user.role)) redirect("/unauthorized");

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF5ED]">
      <div className="hidden lg:block"><AdminNav role={session.user.role} /></div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar name={session.user.name ?? "Team member"} role={session.user.role} />
        <div className="border-b border-beige/40 bg-warm px-2 py-2 lg:hidden">
          <div className="overflow-x-auto"><AdminMobileNav role={session.user.role} /></div>
        </div>
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
