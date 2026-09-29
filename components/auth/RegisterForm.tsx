"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { registerSchema } from "@/lib/validations/auth";
import { zodFieldErrorsClient } from "@/lib/validations/client";
import { apiRequest, ApiRequestError, errorMessage } from "@/lib/client";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

type FormState = typeof emptyForm;

export function RegisterForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrorsClient(parsed.error));
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await apiRequest("/api/auth/register", { method: "POST", body: parsed.data });
      window.location.href = "/dashboard";
    } catch (error) {
      if (error instanceof ApiRequestError) setFieldErrors(error.fieldErrors);
      setFormError(errorMessage(error));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First Name"
          name="firstName"
          autoComplete="given-name"
          value={form.firstName}
          onChange={update}
          error={fieldErrors.firstName}
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          autoComplete="family-name"
          value={form.lastName}
          onChange={update}
          error={fieldErrors.lastName}
          required
        />
      </div>
      <Input
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={form.email}
        onChange={update}
        error={fieldErrors.email}
        required
      />
      <Input
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="e.g. 071 234 5678"
        value={form.phoneNumber}
        onChange={update}
        error={fieldErrors.phoneNumber}
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={form.password}
        onChange={update}
        error={fieldErrors.password}
        hint="At least 8 characters."
        required
      />
      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={update}
        error={fieldErrors.confirmPassword}
        required
      />

      <Button type="submit" fullWidth size="lg" loading={loading} loadingText="Creating account...">
        Create account
      </Button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
