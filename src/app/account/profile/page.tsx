import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  const customer = await prisma.customer.findUnique({ where: { userId: session!.user.id } });
  return (
    <div>
      <h2 className="mb-5 font-display text-xl font-semibold">Your profile</h2>
      <ProfileForm initial={{ name: customer?.name ?? session!.user.name ?? "", email: customer?.email ?? session!.user.email ?? null, phone: customer?.phone ?? null }} />
    </div>
  );
}
