import { cn } from "@/lib/utils";

export function AdminHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="font-display text-2xl font-semibold">{title}</h1>{description && <p className="mt-1 text-sm text-muted">{description}</p>}</div>
      {action}
    </div>
  );
}

export function AdminCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl border border-beige/50 bg-white p-5 shadow-soft", className)}>{children}</div>;
}

export function StatPill({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "success" | "danger" }) {
  return (
    <div className={cn("rounded-2xl p-4", tone === "success" ? "bg-emerald-50" : tone === "danger" ? "bg-red-50" : "bg-cream/60")}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
