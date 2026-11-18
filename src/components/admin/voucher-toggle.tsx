"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { toggleVoucher } from "@/actions/admin";

export function ToggleVoucherForm({ id }: { id: string }) {
  const [_, action, pending] = useActionState(toggleVoucher, { ok: false });
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant="ghost" disabled={pending}>Toggle</Button>
    </form>
  );
}
