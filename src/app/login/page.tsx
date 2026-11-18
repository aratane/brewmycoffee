import { Suspense } from "react";
import { AuthShell, LoginForm } from "@/components/auth/auth-forms";

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back!" subtitle="Your happy cup is waiting. Sign in to continue.">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-cream" />}><LoginForm /></Suspense>
    </AuthShell>
  );
}
