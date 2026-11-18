"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/misc";

export function ProfileForm({ initial }: { initial: { name: string; email: string | null; phone: string | null } }) {
  const { update } = useSession();
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save profile");
      await update({ name });
      toast.success("Profile updated! ✨");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again"); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={save} className="space-y-4 rounded-3xl border border-beige/50 bg-white/70 p-6 shadow-soft">
      <div><Label className="mb-1.5 block">Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} minLength={2} required /></div>
      <div><Label className="mb-1.5 block">Email</Label><Input value={initial.email ?? ""} disabled /><p className="mt-1 text-xs text-muted">Your email can't be changed here.</p></div>
      <div><Label className="mb-1.5 block">WhatsApp number</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812-3456-7890" /></div>
      <Button type="submit" disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}</Button>
    </form>
  );
}
