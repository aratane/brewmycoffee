import { prisma } from "@/lib/prisma";
import { guardPage } from "@/lib/rbac";
import { AdminHeader } from "@/components/admin/admin-ui";
import { EmployeesManager } from "@/components/admin/employees-manager";

export const dynamic = "force-dynamic";

export default async function AdminEmployees() {
  await guardPage("SUPER_ADMIN");
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true, isActive: true, role: { select: { name: true } } } } },
  });
  return (
    <div>
      <AdminHeader title="Employees & Roles" description="Your team, their roles, and who can access what." />
      <EmployeesManager employees={employees.map((e) => ({
        id: e.id, name: e.user.name, email: e.user.email, code: e.cashierCode,
        position: e.position, role: e.user.role.name, active: e.user.isActive, hireDate: e.hireDate.toISOString(),
      }))} />
    </div>
  );
}
