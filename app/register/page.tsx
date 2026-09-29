import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="Register as a resident to report and track sewage problems.">
      <RegisterForm />
    </AuthShell>
  );
}
