"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardIcon, PlusIcon } from "@/components/ui/Icons";
import { Table, TBody, TD, TH, THead } from "@/components/ui/Table";
import { InspectionStatusBadge } from "@/components/reports/StatusBadge";
import {
  INSPECTION_STATUSES,
  INSPECTION_STATUS_LABELS,
  type InspectionStatusValue,
} from "@/lib/constants";
import { formatDate, toDateInputValue } from "@/lib/format";
import { inspectionSchema } from "@/lib/validations/inspection";
import { zodFieldErrorsClient } from "@/lib/validations/client";
import { apiRequest, ApiRequestError, errorMessage } from "@/lib/client";

export type InspectionRow = {
  id: number;
  location: string;
  inspectionDate: string; // ISO string
  inspectorName: string;
  findings: string | null;
  status: InspectionStatusValue;
};

type FormState = {
  location: string;
  inspectionDate: string;
  inspectorName: string;
  findings: string;
  status: InspectionStatusValue;
};

const statusOptions = INSPECTION_STATUSES.map((status) => ({
  value: status,
  label: INSPECTION_STATUS_LABELS[status],
}));

type Filter = InspectionStatusValue | "ALL";

function createReportHref(inspection: InspectionRow) {
  const params = new URLSearchParams({
    from: "inspection",
    location: inspection.location,
    description: `Found during inspection on ${formatDate(inspection.inspectionDate)} by ${inspection.inspectorName}: ${
      inspection.findings ?? "Issue found"
    }`,
  });
  return `/report?${params.toString()}`;
}

export function InspectionsManager({ inspections, teamNames }: { inspections: InspectionRow[]; teamNames: string[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InspectionRow | null>(null);
  const [form, setForm] = useState<FormState>(() => blankForm());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pageMessage, setPageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function blankForm(): FormState {
    return {
      location: "",
      inspectionDate: toDateInputValue(new Date()),
      inspectorName: teamNames[0] ?? "",
      findings: "",
      status: "SCHEDULED",
    };
  }

  const visible = filter === "ALL" ? inspections : inspections.filter((row) => row.status === filter);

  function openCreate() {
    setEditing(null);
    setForm(blankForm());
    setFieldErrors({});
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(row: InspectionRow) {
    setEditing(row);
    setForm({
      location: row.location,
      inspectionDate: toDateInputValue(row.inspectionDate),
      inspectorName: row.inspectorName,
      findings: row.findings ?? "",
      status: row.status,
    });
    setFieldErrors({});
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = inspectionSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrorsClient(parsed.error));
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/api/inspections/${editing.id}`, { method: "PUT", body: parsed.data });
      } else {
        await apiRequest("/api/inspections", { method: "POST", body: parsed.data });
      }
      setModalOpen(false);
      setPageMessage({ type: "success", text: editing ? "Inspection updated." : "Inspection added." });
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError) setFieldErrors(error.fieldErrors);
      setFormError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: InspectionRow) {
    if (!window.confirm(`Delete the inspection at ${row.location} on ${formatDate(row.inspectionDate)}?`)) return;
    setBusyId(row.id);
    setPageMessage(null);
    try {
      await apiRequest(`/api/inspections/${row.id}`, { method: "DELETE" });
      setPageMessage({ type: "success", text: "Inspection deleted." });
      router.refresh();
    } catch (error) {
      setPageMessage({ type: "error", text: errorMessage(error) });
    } finally {
      setBusyId(null);
    }
  }

  const filters: { value: Filter; label: string }[] = [
    { value: "ALL", label: "All" },
    ...statusOptions.map((option) => ({ value: option.value, label: option.label })),
  ];

  return (
    <>
      {pageMessage ? (
        <Alert variant={pageMessage.type} className="mb-4">
          {pageMessage.text}
        </Alert>
      ) : null}

      <Card
        padded={false}
        title="Inspection log"
        description="Weekly sewer inspections across Khayelitsha."
        actions={
          <Button onClick={openCreate}>
            <PlusIcon className="h-4 w-4" /> Schedule inspection
          </Button>
        }
      >
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-4" role="group" aria-label="Filter by status">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                filter === option.value ? "bg-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<ClipboardIcon className="h-6 w-6" />}
            title="No inspections found."
            description="Schedule an inspection to start the weekly monitoring log."
          />
        ) : (
          <Table caption="Inspections">
            <THead>
              <tr>
                <TH>Location</TH>
                <TH>Inspection Date</TH>
                <TH>Inspector</TH>
                <TH>Findings</TH>
                <TH>Status</TH>
                <TH>
                  <span className="sr-only">Actions</span>
                </TH>
              </tr>
            </THead>
            <TBody>
              {visible.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <TD className="font-semibold">{row.location}</TD>
                  <TD className="whitespace-nowrap">{formatDate(row.inspectionDate)}</TD>
                  <TD className="whitespace-nowrap">{row.inspectorName}</TD>
                  <TD className="min-w-[14rem] text-muted">{row.findings ?? "—"}</TD>
                  <TD>
                    <InspectionStatusBadge status={row.status} />
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-2">
                      {row.status === "ISSUE_FOUND" ? (
                        <Link href={createReportHref(row)} className={buttonClasses("primary", "sm", "whitespace-nowrap")}>
                          Create report
                        </Link>
                      ) : null}
                      <Button size="sm" variant="secondary" onClick={() => openEdit(row)} disabled={busyId === row.id}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(row)}
                        loading={busyId === row.id}
                        loadingText="Deleting..."
                      >
                        Delete
                      </Button>
                    </div>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? "Edit inspection" : "Schedule inspection"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave} noValidate className="space-y-4">
          {formError ? <Alert variant="error">{formError}</Alert> : null}
          <Input
            label="Location"
            name="location"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
            error={fieldErrors.location}
            placeholder="e.g. Ext. 12, Khayelitsha"
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Inspection Date"
              name="inspectionDate"
              type="date"
              value={form.inspectionDate}
              onChange={(event) => setForm({ ...form, inspectionDate: event.target.value })}
              error={fieldErrors.inspectionDate}
              required
            />
            <Input
              label="Inspector"
              name="inspectorName"
              value={form.inspectorName}
              onChange={(event) => setForm({ ...form, inspectorName: event.target.value })}
              error={fieldErrors.inspectorName}
              list="inspector-suggestions"
              placeholder="e.g. Team A"
              required
            />
            <datalist id="inspector-suggestions">
              {teamNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <Textarea
            label="Findings"
            name="findings"
            rows={3}
            value={form.findings}
            onChange={(event) => setForm({ ...form, findings: event.target.value })}
            error={fieldErrors.findings}
            placeholder="e.g. Blocked drain discovered near the spaza shop."
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as InspectionStatusValue })}
            options={statusOptions}
            error={fieldErrors.status}
            hint="Choose Issue Found to be able to create a repair report from it."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {editing ? "Save changes" : "Add inspection"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
