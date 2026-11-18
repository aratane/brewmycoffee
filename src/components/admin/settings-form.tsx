"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { updateSetting, type ActionState } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/misc";

export function SettingsForm({ settings }: { settings: Array<{ key: string; value: string; description: string | null }> }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSetting, { ok: false });
  useEffect(() => { if (state.ok) toast.success("Settings saved!"); }, [state.ok]);
  const get = (key: string) => settings.find((s) => s.key === key)?.value ?? "";

  return (
    <form action={action} className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-3xl border border-beige/50 bg-white p-6 shadow-soft lg:col-span-2">
        <h2 className="font-display text-lg font-semibold">Store information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["store_name", "Store name"], ["store_phone", "Phone"], ["store_email", "Email"], ["opening_hours", "Opening hours"],
          ].map(([key, label]) => (
            <div key={key}><Label className="mb-1.5 block">{label}</Label><Input name={`setting:${key}`} defaultValue={get(key)} /></div>
          ))}
          <div className="sm:col-span-2"><Label className="mb-1.5 block">Address</Label><Input name="setting:store_address" defaultValue={get("store_address")} /></div>
        </div>
      </div>

      <div className="rounded-3xl border border-beige/50 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Bank accounts (manual transfer)</h2>
        <p className="mt-1 text-xs text-muted">These are shown to customers when the payment gateway is not configured.</p>
        <div className="mt-4 space-y-3">
          {["bca", "bni", "bri", "mandiri", "permata"].map((bank) => (
            <div key={bank}><Label className="mb-1 block uppercase">{bank}</Label><Input name={`setting:bank_account_${bank}`} defaultValue={get(`bank_account_${bank}`)} /></div>
          ))}
          <div><Label className="mb-1 block">Account holder</Label><Input name="setting:bank_account_name" defaultValue={get("bank_account_name")} /></div>
        </div>
      </div>

      <div className="rounded-3xl border border-beige/50 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold">Payment configuration</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between rounded-xl bg-cream/50 p-3"><span className="text-muted">Payment mode</span><span className="font-bold">{process.env.NEXT_PUBLIC_PAYMENT_MODE ?? "server-side"}</span></div>
          <div className="flex justify-between rounded-xl bg-cream/50 p-3"><span className="text-muted">Midtrans server key</span><span className="font-bold">{process.env.NEXT_PUBLIC_MIDTRANS_CONFIGURED ?? "Set in .env"}</span></div>
          <p className="text-xs leading-relaxed text-muted">Secret keys are read server-side only. Set PAYMENT_MODE, MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY and MIDTRANS_WEBHOOK_SECRET in your <code>.env</code> file to enable real QRIS and virtual accounts.</p>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600 lg:col-span-2">{state.error}</p>}
      <div className="lg:col-span-2"><Button type="submit" size="lg" disabled={pending}><Save className="h-4 w-4" /> {pending ? "Saving..." : "Save all settings"}</Button></div>
    </form>
  );
}
