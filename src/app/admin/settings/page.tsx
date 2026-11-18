import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/admin-ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  await guardPage("ADMIN");
  const settings = await prisma.storeSetting.findMany({ orderBy: { key: "asc" } });
  return (
    <div>
      <AdminHeader title="Settings" description="Store details and payment configuration." />
      <SettingsForm settings={settings.map((s) => ({ key: s.key, value: (s.value as { value?: string })?.value ?? "", description: s.description }))} />
    </div>
  );
}
