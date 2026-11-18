"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Pencil, Search } from "lucide-react";
import { createProduct, updateProduct, type ActionState } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn, formatIDR } from "@/lib/utils";

export type AdminProduct = {
  id: string; name: string; sku: string; price: number; imageUrl: string | null;
  isAvailable: boolean; isFeatured: boolean; soldCount: number;
  category: { name: string }; categoryId: string; description: string; preparationTime: number;
};

const initial: ActionState = { ok: false };

export function ProductsManager({ products, categories }: { products: AdminProduct[]; categories: Array<{ id: string; name: string }> }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [createState, createAction, creating] = useActionState(createProduct, initial);
  const [updateState, updateAction, updating] = useActionState(updateProduct, initial);

  useEffect(() => {
    if (createState.ok) { setOpen(false); toast.success("Product created!"); }
  }, [createState.ok]);
  useEffect(() => {
    if (updateState.ok) { setEditing(null); toast.success("Product updated!"); }
  }, [updateState.ok]);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="rounded-3xl border border-beige/50 bg-white p-5 shadow-soft">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mocha/50" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="w-64 pl-9" /></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New product</Button></DialogTrigger>
          <DialogContent>
            <DialogTitle>Add a new product</DialogTitle>
            <form action={createAction} className="mt-5 space-y-3">
              <TextField name="name" label="Name" required />
              <div className="grid grid-cols-2 gap-3"><TextField name="sku" label="SKU" required /><TextField name="price" label="Price (IDR)" type="number" required /></div>
              <div><label className="mb-1 block text-xs font-bold">Category</label><select name="categoryId" className="input-artisan" required>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="mb-1 block text-xs font-bold">Description</label><textarea name="description" className="input-artisan h-24 py-2" required /></div>
              <TextField name="imageUrl" label="Image URL (optional)" />
              <TextField name="preparationTime" label="Prep time (min)" type="number" defaultValue="5" />
              <div className="flex gap-5"><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="isAvailable" defaultChecked /> Available</label><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="isFeatured" /> Featured</label></div>
              {createState.error && <p className="text-xs text-red-600">{createState.error}</p>}
              <Button type="submit" disabled={creating} className="w-full">{creating ? "Creating..." : "Create product"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-beige/50 text-[11px] uppercase tracking-wider text-muted"><tr><th className="py-2">Product</th><th>Category</th><th>SKU</th><th>Price</th><th>Status</th><th>Sold</th><th /></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-beige/30 last:border-0">
                <td className="py-3"><div className="flex items-center gap-3"><div className="relative h-10 w-10 overflow-hidden rounded-xl bg-cream">{p.imageUrl && <Image src={p.imageUrl} alt="" fill sizes="40px" className="object-cover" />}</div><div><p className="font-semibold">{p.name}</p>{p.isFeatured && <Badge tone="pink" className="mt-0.5">Featured</Badge>}</div></div></td>
                <td className="text-muted">{p.category.name}</td><td className="font-mono text-xs text-muted">{p.sku}</td>
                <td className="font-bold">{formatIDR(p.price)}</td>
                <td><Badge tone={p.isAvailable ? "success" : "danger"}>{p.isAvailable ? "Available" : "Hidden"}</Badge></td>
                <td className="text-muted">{p.soldCount}</td>
                <td><Dialog open={editing?.id === p.id} onOpenChange={(v) => !v && setEditing(null)}><DialogTrigger asChild><Button variant="ghost" size="icon" onClick={() => setEditing(p)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button></DialogTrigger><DialogContent><DialogTitle>Edit {p.name}</DialogTitle><form action={updateAction} className="mt-5 space-y-3"><input type="hidden" name="id" value={p.id} /><TextField name="name" label="Name" defaultValue={p.name} /><div className="grid grid-cols-2 gap-3"><TextField name="price" label="Price" type="number" defaultValue={p.price} /><div><label className="mb-1 block text-xs font-bold">Category</label><select name="categoryId" defaultValue={p.categoryId} className="input-artisan">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div><div><label className="mb-1 block text-xs font-bold">Description</label><textarea name="description" defaultValue={p.description} className="input-artisan h-24 py-2" /></div><div className="flex gap-5"><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="isAvailable" defaultChecked={p.isAvailable} /> Available</label><label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="isFeatured" defaultChecked={p.isFeatured} /> Featured</label></div>{updateState.error && <p className="text-xs text-red-600">{updateState.error}</p>}<Button type="submit" disabled={updating} className="w-full">{updating ? "Saving..." : "Save changes"}</Button></form></DialogContent></Dialog></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TextField({ name, label, type = "text", defaultValue, required }: { name: string; label: string; type?: string; defaultValue?: string | number; required?: boolean }) {
  return <div><label className="mb-1 block text-xs font-bold">{label}</label><Input name={name} type={type} defaultValue={defaultValue} required={required} className={cn("h-10")} /></div>;
}
