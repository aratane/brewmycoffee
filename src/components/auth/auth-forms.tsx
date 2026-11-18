"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Coffee, ArrowRight, Sparkles } from "lucide-react";
import { loginSchema, registerSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/misc";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    const res = await signIn("credentials", { ...data, redirect: false });
    setLoading(false);
    if (res?.error) { toast.error("Email or password is incorrect."); return; }
    toast.success("Welcome back, coffee lover! ☕");
    const callback = params.get("callbackUrl");
    router.push(callback && callback.startsWith("/") ? callback : "/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Email" error={errors.email?.message}>
        <Input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email" />
      </Field>
      <Field label="Password" error={errors.password?.message}>
        <Input {...register("password")} type="password" placeholder="••••••••" autoComplete="current-password" />
      </Field>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Signing in..." : "Sign in"} <ArrowRight className="h-4 w-4" /></Button>
      <p className="text-center text-xs text-muted">New here? <Link href="/register" className="font-bold text-mocha underline">Create an account</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Registration failed");
      toast.success("Welcome to the coffee family! 🎉");
      const signed = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (signed?.error) { router.push("/login"); return; }
      router.push("/account");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Full name" error={errors.name?.message}><Input {...register("name")} placeholder="Cindy Coffee" /></Field>
      <Field label="Email" error={errors.email?.message}><Input {...register("email")} type="email" placeholder="you@example.com" /></Field>
      <Field label="WhatsApp number" error={errors.phone?.message}><Input {...register("phone")} placeholder="0812-3456-7890" /></Field>
      <Field label="Password" error={errors.password?.message}><Input {...register("password")} type="password" placeholder="At least 8 characters" /></Field>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Creating account..." : "Join the family"} <Sparkles className="h-4 w-4" /></Button>
      <p className="text-center text-xs text-muted">Already a member? <Link href="/login" className="font-bold text-mocha underline">Sign in</Link></p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><Label className="mb-1.5 block">{label}</Label>{children}{error && <p className="mt-1 text-xs text-red-600">{error}</p>}</div>;
}

export function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="blob-bg flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md px-5">
        <div className="mb-7 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mocha text-warm shadow-soft"><Coffee className="h-6 w-6" /></span>
          <h1 className="mt-4 font-display text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="rounded-3xl border border-beige/50 bg-white/75 p-7 shadow-soft backdrop-blur">{children}</div>
      </div>
    </div>
  );
}
