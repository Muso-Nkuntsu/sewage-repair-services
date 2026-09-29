"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { loginSchema } from "@/lib/validations/auth";
import { zodFieldErrorsClient } from "@/lib/validations/client";
import { apiRequest, ApiRequestError, errorMessage } from "@/lib/client";

type LoginResponse = { user: { role: "ADMIN" | "RESIDENT" }; redirectTo: string };

function safeNextPath(next: string | undefined, role: "ADMIN" | "RESIDENT"): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  const isAdminPath = next === "/admin" || next.startsWith("/admin/");
  if (role === "ADMIN" && isAdminPath) return next;
  if (role === "RESIDENT" && !isAdminPath) return next;
  return null;
}

export function LoginForm({ next }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrorsClient(parsed.error));
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      const result = await apiRequest<LoginResponse>("/api/auth/login", { method: "POST", body: parsed.data });
      // Full navigation so the navbar and all server components pick up the new session.
      window.location.href = safeNextPath(next, result.user.role) ?? result.redirectTo;
    } catch (error) {
      if (error instanceof ApiRequestError) setFieldErrors(error.fieldErrors);
      setFormError(errorMessage(error));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        required
      />

      <Button type="submit" fullWidth size="lg" loading={loading} loadingText="Logging in...">
        Login
      </Button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
