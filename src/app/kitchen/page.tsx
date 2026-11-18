import { guardPage } from "@/lib/rbac";
import { KitchenBoard } from "@/components/kitchen/kitchen-board";

export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  await guardPage("BARISTA");
  return (
    <div className="min-h-screen bg-[#FBF5ED] p-5 lg:p-7">
      <KitchenBoard />
    </div>
  );
}
