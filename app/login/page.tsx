import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Login" };

type LoginPageProps = { searchParams: Promise<{ next?: string | string[] }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <AuthShell title="Welcome back" subtitle="Log in to report issues and track repairs.">
      <LoginForm next={next} />

      <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-muted">
        <p className="font-semibold text-navy">Demo accounts</p>
        <p>
          Resident: <span className="font-mono">resident1@sewage.local</span> /{" "}
          <span className="font-mono">Resident123!</span>
        </p>
      </div>
    </AuthShell>
  );
}
