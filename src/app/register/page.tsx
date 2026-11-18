import { AuthShell, RegisterForm } from "@/components/auth/auth-forms";

export default function RegisterPage() {
  return (
    <AuthShell title="Join the coffee family" subtitle="Create an account to collect loyalty points and track orders.">
      <RegisterForm />
    </AuthShell>
  );
}
