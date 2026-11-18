import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  default: "bg-mocha/10 text-mocha",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
  pink: "bg-pink/60 text-ink",
};

export function Badge({ children, tone = "default", className }: { children: React.ReactNode; tone?: keyof typeof styles; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", styles[tone], className)}>{children}</span>;
}
