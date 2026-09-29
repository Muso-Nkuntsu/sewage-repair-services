"use client";

import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { CheckIcon } from "@/components/ui/Icons";
import { StatusBadge } from "./StatusBadge";
import { ISSUE_TYPES, ISSUE_TYPE_HINTS, ISSUE_TYPE_LABELS, type IssueTypeValue } from "@/lib/constants";
import { createReportSchema } from "@/lib/validations/report";
import { zodFieldErrorsClient } from "@/lib/validations/client";
import { apiRequest, ApiRequestError, errorMessage } from "@/lib/client";

type CreatedReport = { id: number; referenceNumber: number; status: "REPORTED" };

type ReportFormProps = {
  defaults?: {
    issueType?: IssueTypeValue;
    location?: string;
    landmark?: string;
    description?: string;
    contactPhone?: string;
  };
  trackBasePath?: string;
};

export function ReportForm({ defaults = {}, trackBasePath = "/reports" }: ReportFormProps) {
  const [issueType, setIssueType] = useState<IssueTypeValue | "">(defaults.issueType ?? "");
  const [location, setLocation] = useState(defaults.location ?? "");
  const [landmark, setLandmark] = useState(defaults.landmark ?? "");
  const [description, setDescription] = useState(defaults.description ?? "");
  const [contactPhone, setContactPhone] = useState(defaults.contactPhone ?? "");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedReport | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const payload = { issueType, location, landmark, description, contactPhone };
    const parsed = createReportSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrorsClient(parsed.error));
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    try {
      const result = await apiRequest<{ report: CreatedReport }>("/api/reports", {
        method: "POST",
        body: parsed.data,
      });
      setCreated(result.report);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof ApiRequestError) setFieldErrors(error.fieldErrors);
      setFormError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setCreated(null);
    setIssueType("");
    setLocation("");
    setLandmark("");
    setDescription("");
    setFormError(null);
    setFieldErrors({});
  }

  if (created) {
    return (
      <div className="rounded-xl border border-green-200 bg-white p-6 text-center shadow-sm sm:p-8" role="status">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-success">
          <CheckIcon className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-navy">Report submitted successfully.</h2>
        <p className="mt-1 text-sm text-muted">Thank you. Our team has been notified and will review it shortly.</p>

        <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 text-left">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Reference</dt>
            <dd className="font-mono text-2xl font-bold text-brand">#{created.referenceNumber}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">Status</dt>
            <dd className="mt-1.5">
              <StatusBadge status={created.status} />
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">Keep this reference number to follow up on your report.</p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={`${trackBasePath}/${created.id}`} size="lg">
            Track Report
          </ButtonLink>
          <Button variant="secondary" size="lg" onClick={resetForm}>
            Report another issue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <fieldset>
        <legend className="field-label">
          What is the problem? <span className="text-red-600">*</span>
        </legend>
        <div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          aria-describedby={fieldErrors.issueType ? "issueType-error" : undefined}
        >
          {ISSUE_TYPES.map((type) => {
            const checked = issueType === type;
            return (
              <label
                key={type}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${
                  checked ? "border-brand bg-brand-light" : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="issueType"
                  value={type}
                  checked={checked}
                  onChange={() => setIssueType(type)}
                  className="mt-1 h-4 w-4 accent-brand"
                />
                <span>
                  <span className="block font-semibold text-navy">{ISSUE_TYPE_LABELS[type]}</span>
                  <span className="block text-xs text-muted">{ISSUE_TYPE_HINTS[type]}</span>
                </span>
              </label>
            );
          })}
        </div>
        {fieldErrors.issueType ? (
          <p id="issueType-error" className="mt-1 text-sm text-red-600">
            {fieldErrors.issueType}
          </p>
        ) : null}
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Area / Extension"
          name="location"
          placeholder="e.g. Ext. 12, Khayelitsha"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          error={fieldErrors.location}
          autoComplete="address-level3"
          required
        />
        <Input
          label="Street / Landmark"
          name="landmark"
          placeholder="e.g. Near local spaza shop"
          value={landmark}
          onChange={(event) => setLandmark(event.target.value)}
          error={fieldErrors.landmark}
          hint="Optional, but it helps the team find the spot."
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        placeholder="Describe what you see..."
        rows={5}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={fieldErrors.description}
        hint="How bad is it? How long has it been like this? Is it near homes, a school or a business?"
        required
      />

      <Input
        label="Contact phone number"
        name="contactPhone"
        type="tel"
        inputMode="tel"
        placeholder="e.g. 071 234 5678"
        value={contactPhone}
        onChange={(event) => setContactPhone(event.target.value)}
        error={fieldErrors.contactPhone}
        hint="Optional. The repair team may call you if they can't find the location."
        autoComplete="tel"
      />

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-muted">
        Map pin and photo upload are planned for a future version. For now, a clear area and landmark is enough.
      </div>

      <Button type="submit" size="lg" fullWidth loading={submitting} loadingText="Submitting...">
        Submit Report
      </Button>
    </form>
  );
}
