import { guardPage } from "@/lib/rbac";
import { AccountNav } from "@/components/account/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await guardPage("CUSTOMER");
  return (
    <div className="blob-bg min-h-screen">
      <div className="container-artisan py-10">
        <div className="mb-7">
          <span className="section-label">🐰 Your Corner</span>
          <h1 className="heading-lg mt-2">Hi, {user.name?.split(" ")[0]}! Welcome back.</h1>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <AccountNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
