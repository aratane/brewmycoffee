import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-beige/70 bg-warm px-4 py-2 text-sm text-ink outline-none transition placeholder:text-mocha/40 focus:border-caramel focus:ring-2 focus:ring-caramel/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[96px] w-full rounded-xl border border-beige/70 bg-warm px-4 py-3 text-sm text-ink outline-none transition placeholder:text-mocha/40 focus:border-caramel focus:ring-2 focus:ring-caramel/20",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
