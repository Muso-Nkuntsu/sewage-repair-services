"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlusIcon, UsersIcon } from "@/components/ui/Icons";
import { Table, TBody, TD, TH, THead } from "@/components/ui/Table";
import { TeamStatusBadge } from "@/components/reports/StatusBadge";
import { TEAM_STATUSES, TEAM_STATUS_LABELS, type TeamStatusValue } from "@/lib/constants";
import { teamSchema } from "@/lib/validations/team";
import { zodFieldErrorsClient } from "@/lib/validations/client";
import { apiRequest, ApiRequestError, errorMessage } from "@/lib/client";

export type TeamRow = {
  id: number;
  name: string;
  contactNumber: string | null;
  technicianCount: number;
  status: TeamStatusValue;
  activeJobs: number;
};

type FormState = { name: string; contactNumber: string; technicianCount: string; status: TeamStatusValue };

const emptyForm: FormState = { name: "", contactNumber: "", technicianCount: "2", status: "ON_DUTY" };
const statusOptions = TEAM_STATUSES.map((status) => ({ value: status, label: TEAM_STATUS_LABELS[status] }));

export function TeamsManager({ teams }: { teams: TeamRow[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pageMessage, setPageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFieldErrors({});
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(team: TeamRow) {
    setEditing(team);
    setForm({
      name: team.name,
      contactNumber: team.contactNumber ?? "",
      technicianCount: String(team.technicianCount),
      status: team.status,
    });
    setFieldErrors({});
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = teamSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrorsClient(parsed.error));
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/api/teams/${editing.id}`, { method: "PUT", body: parsed.data });
      } else {
        await apiRequest("/api/teams", { method: "POST", body: parsed.data });
      }
      setModalOpen(false);
      setPageMessage({ type: "success", text: editing ? `${parsed.data.name} updated.` : `${parsed.data.name} created.` });
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setFieldErrors(error.status === 409 ? { name: "A team with this name already exists." } : error.fieldErrors);
      }
      setFormError(
        error instanceof ApiRequestError && error.status === 409
          ? "A team with this name already exists."
          : errorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleDuty(team: TeamRow) {
    setBusyId(team.id);
    setPageMessage(null);
    try {
      const nextStatus: TeamStatusValue = team.status === "ON_DUTY" ? "OFF_DUTY" : "ON_DUTY";
      await apiRequest(`/api/teams/${team.id}`, {
        method: "PUT",
        body: {
          name: team.name,
          contactNumber: team.contactNumber ?? "",
          technicianCount: team.technicianCount,
          status: nextStatus,
        },
      });
      setPageMessage({ type: "success", text: `${team.name} is now ${TEAM_STATUS_LABELS[nextStatus]}.` });
      router.refresh();
    } catch (error) {
      setPageMessage({ type: "error", text: errorMessage(error) });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(team: TeamRow) {
    const warning =
      team.activeJobs > 0
        ? `${team.name} has ${team.activeJobs} active job(s). Deleting it will unassign those reports. Continue?`
        : `Delete ${team.name}? Past reports keep their history but lose the team link.`;
    if (!window.confirm(warning)) return;
    setBusyId(team.id);
    setPageMessage(null);
    try {
      await apiRequest(`/api/teams/${team.id}`, { method: "DELETE" });
      setPageMessage({ type: "success", text: `${team.name} deleted.` });
      router.refresh();
    } catch (error) {
      setPageMessage({ type: "error", text: errorMessage(error) });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {pageMessage ? (
        <Alert variant={pageMessage.type} className="mb-4">
          {pageMessage.text}
        </Alert>
      ) : null}

      <Card
        padded={false}
        title="Repair teams"
        description="Teams that can be assigned to reports and inspections."
        actions={
          <Button onClick={openCreate}>
            <PlusIcon className="h-4 w-4" /> Add team
          </Button>
        }
      >
        {teams.length === 0 ? (
          <EmptyState
            icon={<UsersIcon className="h-6 w-6" />}
            title="No teams yet."
            description="Create your first repair team to start assigning reports."
          />
        ) : (
          <Table caption="Repair teams">
            <THead>
              <tr>
                <TH>Team Name</TH>
                <TH>Contact Number</TH>
                <TH>Technicians</TH>
                <TH>Active jobs</TH>
                <TH>Status</TH>
                <TH>
                  <span className="sr-only">Actions</span>
                </TH>
              </tr>
            </THead>
            <TBody>
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-slate-50">
                  <TD className="font-semibold">{team.name}</TD>
                  <TD className="whitespace-nowrap text-muted">{team.contactNumber ?? "—"}</TD>
                  <TD>{team.technicianCount} technicians</TD>
                  <TD>{team.activeJobs}</TD>
                  <TD>
                    <TeamStatusBadge status={team.status} />
                  </TD>
                  <TD>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(team)} disabled={busyId === team.id}>
                        Edit<span className="sr-only"> {team.name}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleDuty(team)}
                        loading={busyId === team.id}
                        loadingText="Saving..."
                      >
                        {team.status === "ON_DUTY" ? "Set off duty" : "Set on duty"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(team)}
                        disabled={busyId === team.id}
                      >
                        Delete<span className="sr-only"> {team.name}</span>
                      </Button>
                    </div>
                  </TD>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal open={modalOpen} title={editing ? `Edit ${editing.name}` : "Add team"} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} noValidate className="space-y-4">
          {formError ? <Alert variant="error">{formError}</Alert> : null}
          <Input
            label="Team Name"
            name="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            error={fieldErrors.name}
            placeholder="e.g. Team D"
            required
          />
          <Input
            label="Contact Number"
            name="contactNumber"
            type="tel"
            value={form.contactNumber}
            onChange={(event) => setForm({ ...form, contactNumber: event.target.value })}
            error={fieldErrors.contactNumber}
            placeholder="e.g. 021 555 0104"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Number of Technicians"
              name="technicianCount"
              type="number"
              min={1}
              max={50}
              value={form.technicianCount}
              onChange={(event) => setForm({ ...form, technicianCount: event.target.value })}
              error={fieldErrors.technicianCount}
              required
            />
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as TeamStatusValue })}
              options={statusOptions}
              error={fieldErrors.status}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              {editing ? "Save changes" : "Create team"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
