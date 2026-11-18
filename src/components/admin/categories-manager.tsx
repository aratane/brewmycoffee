"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { createCategory, type ActionState } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const initial: ActionState = { ok: false };

export function CategoriesManager({ categories }: { categories: Array<{ id: string; name: string; slug: string; productCount: number; isActive: boolean }> }) {
  const [state, action, pending] = useActionState(createCategory, initial);
  useEffect(() => { if (state.ok) toast.success("Category created!"); }, [state.ok]);
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New category</Button></DialogTrigger>
          <DialogContent>
            <DialogTitle>Add a category</DialogTitle>
            <form action={action} className="mt-5 space-y-3">
              <div><label className="mb-1 block text-xs font-bold">Name</label><Input name="name" required placeholder="e.g. Seasonal" /></div>
              <div><label className="mb-1 block text-xs font-bold">Description</label><Input name="description" placeholder="A short description" /></div>
              <div><label className="mb-1 block text-xs font-bold">Sort order</label><Input name="sortOrder" type="number" defaultValue="0" /></div>
              {state.error && <p className="text-xs text-red-600">{state.error}</p>}
              <Button type="submit" disabled={pending} className="w-full">{pending ? "Creating..." : "Create category"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between"><h3 className="font-display text-lg font-semibold">{c.name}</h3><Badge tone={c.isActive ? "success" : "danger"}>{c.isActive ? "Active" : "Hidden"}</Badge></div>
            <p className="mt-1 font-mono text-xs text-muted">/{c.slug}</p>
            <p className="mt-4 text-sm font-bold">{c.productCount} <span className="font-normal text-muted">products</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}
