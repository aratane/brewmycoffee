"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { createEmployee, type ActionState } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function EmployeesManager({ employees }: { employees: Array<{ id: string; name: string; email: string; code: string; position: string; role: string; active: boolean; hireDate: string }> }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createEmployee, { ok: false });
  useEffect(() => {
    if (state.ok) { toast.success("Team member added!"); window.location.reload(); }
  }, [state.ok]);

  return (
    <div className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft">
      <div className="mb-5 flex justify-end">
        <Dialog>
          <DialogTrigger asChild><Button><UserPlus className="h-4 w-4" /> Add team member</Button></DialogTrigger>
          <DialogContent>
            <DialogTitle>Add a team member</DialogTitle>
            <form action={action} className="mt-5 space-y-3">
              <Input name="name" placeholder="Full name" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="phone" placeholder="Phone (optional)" />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="mb-1 block text-xs font-bold">Role</label><select name="role" className="input-artisan"><option value="CASHIER">Cashier</option><option value="BARISTA">Barista</option><option value="ADMIN">Admin</option></select></div>
                <Input name="position" placeholder="Position" defaultValue="Staff" />
              </div>
              <Input name="password" type="password" placeholder="Temporary password (8+ chars)" required minLength={8} />
              {state.error && <p className="text-xs text-red-600">{state.error}</p>}
              <Button type="submit" disabled={pending} className="w-full">{pending ? "Adding..." : "Add member"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-beige/50 text-[11px] uppercase tracking-wider text-muted"><tr><th className="py-2">Name</th><th>Email</th><th>Code</th><th>Position</th><th>Role</th><th>Status</th><th>Hired</th></tr></thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-beige/30 text-xs last:border-0">
                <td className="py-3 font-bold">{e.name}</td><td className="text-muted">{e.email}</td><td className="font-mono text-muted">{e.code}</td>
                <td className="text-muted">{e.position}</td><td><Badge tone="info">{e.role.replace("_", " ")}</Badge></td>
                <td><Badge tone={e.active ? "success" : "danger"}>{e.active ? "Active" : "Inactive"}</Badge></td>
                <td className="text-muted">{formatDate(e.hireDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
