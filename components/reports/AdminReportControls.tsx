"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import {
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  TEAM_STATUS_LABELS,
  type ReportStatusValue,
  type TeamStatusValue,
} from "@/lib/constants";
import { apiRequest, ApiRequestError, errorMessage } from "@/lib/client";

type TeamOption = { id: number; name: string; technicianCount: number; status: TeamStatusValue };

type AdminReportControlsProps = {
  reportId: number;
  reference: string;
  currentStatus: ReportStatusValue;
  currentTeamId: number | null;
  currentEta: string | null;
  teams: TeamOption[];
};

type Feedback = { type: "success" | "error"; message: string } | null;

const statusOptions = REPORT_STATUSES.map((status) => ({ value: status, label: REPORT_STATUS_LABELS[status] }));
const ETA_SUGGESTIONS = ["30 minutes", "45 minutes", "1 hour", "2 hours", "4 hours", "Tomorrow"];

export function AdminReportControls({
  reportId,
  reference,
  currentStatus,
  currentTeamId,
  currentEta,
  teams,
}: AdminReportControlsProps) {
  const router = useRouter();

  // Assign team
  const [teamId, setTeamId] = useState(currentTeamId ? String(currentTeamId) : "");
  const [eta, setEta] = useState(currentEta ?? "");
  const [assigning, setAssigning] = useState(false);
  const [assignFeedback, setAssignFeedback] = useState<Feedback>(null);
  const [assignErrors, setAssignErrors] = useState<Record<string, string>>({});

  // Status
  const [status, setStatus] = useState<ReportStatusValue>(currentStatus);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<Feedback>(null);

  // Repair update
  const [comment, setComment] = useState("");
  const [updateStatus, setUpdateStatus] = useState<ReportStatusValue | "">("");
  const [addingUpdate, setAddingUpdate] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<Feedback>(null);
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Keep the form in sync after router.refresh() brings new server data.
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);
  useEffect(() => {
    setTeamId(currentTeamId ? String(currentTeamId) : "");
  }, [currentTeamId]);
  useEffect(() => {
    setEta(currentEta ?? "");
  }, [currentEta]);

  const teamOptions = teams.map((team) => ({
    value: String(team.id),
    label: `${team.name} — ${team.technicianCount} technicians (${TEAM_STATUS_LABELS[team.status]})`,
  }));

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAssignFeedback(null);
    setAssignErrors({});
    if (!teamId) {
      setAssignErrors({ teamId: "Please choose a team." });
      return;
    }
    setAssigning(true);
    try {
      const selectedTeamId = Number(teamId);
      if (selectedTeamId === currentTeamId) {
        await apiRequest(`/api/reports/${reportId}`, { method: "PUT", body: { eta: eta.trim() || null } });
        setAssignFeedback({ type: "success", message: "ETA updated." });
      } else {
        await apiRequest(`/api/reports/${reportId}/assign`, {
          method: "POST",
          body: { teamId: selectedTeamId, eta: eta.trim() || undefined },
        });
        const teamName = teams.find((team) => team.id === selectedTeamId)?.name ?? "team";
        setAssignFeedback({
          type: "success",
          message:
            currentStatus === "REPORTED"
              ? `Assigned to ${teamName}. Status is now Assigned.`
              : `Assigned to ${teamName}.`,
        });
      }
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError) setAssignErrors(error.fieldErrors);
      setAssignFeedback({ type: "error", message: errorMessage(error) });
    } finally {
      setAssigning(false);
    }
  }

  async function handleStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusFeedback(null);
    if (status === currentStatus) {
      setStatusFeedback({ type: "error", message: "Choose a different status to update." });
      return;
    }
    setSavingStatus(true);
    try {
      await apiRequest(`/api/reports/${reportId}`, { method: "PUT", body: { status } });
      setStatusFeedback({ type: "success", message: `Status changed to ${REPORT_STATUS_LABELS[status]}.` });
      router.refresh();
    } catch (error) {
      setStatusFeedback({ type: "error", message: errorMessage(error) });
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleAddUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUpdateFeedback(null);
    setUpdateErrors({});
    if (comment.trim().length < 3) {
      setUpdateErrors({ comment: "Please write an update (at least 3 characters)." });
      return;
    }
    setAddingUpdate(true);
    try {
      await apiRequest(`/api/reports/${reportId}/updates`, {
        method: "POST",
        body: { comment: comment.trim(), status: updateStatus || undefined },
      });
      setComment("");
      setUpdateStatus("");
      setUpdateFeedback({
        type: "success",
        message: updateStatus
          ? `Update added and status changed to ${REPORT_STATUS_LABELS[updateStatus]}.`
          : "Update added.",
      });
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError) setUpdateErrors(error.fieldErrors);
      setUpdateFeedback({ type: "error", message: errorMessage(error) });
    } finally {
      setAddingUpdate(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete report ${reference} and all of its updates? This cannot be undone.`)) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiRequest(`/api/reports/${reportId}`, { method: "DELETE" });
      router.push("/admin/reports");
      router.refresh();
    } catch (error) {
      setDeleteError(errorMessage(error));
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Assign team" description="Assigning a team to a new report sets it to Assigned automatically.">
        <form onSubmit={handleAssign} noValidate className="space-y-4">
          {assignFeedback ? <Alert variant={assignFeedback.type}>{assignFeedback.message}</Alert> : null}
          {teams.length === 0 ? (
            <Alert variant="warning">No teams exist yet. Create one on the Teams page first.</Alert>
          ) : null}
          <Select
            label="Repair team"
            name="teamId"
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            options={teamOptions}
            placeholder="Select a team"
            error={assignErrors.teamId}
          />
          <Input
            label="ETA"
            name="eta"
            value={eta}
            onChange={(event) => setEta(event.target.value)}
            placeholder="e.g. 45 minutes"
            list="eta-suggestions"
            error={assignErrors.eta}
            hint="Free text, e.g. 45 minutes, 2 hours, Tomorrow."
          />
          <datalist id="eta-suggestions">
            {ETA_SUGGESTIONS.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          <Button type="submit" fullWidth loading={assigning} loadingText="Saving..." disabled={teams.length === 0}>
            {currentTeamId ? "Save assignment" : "Assign Team"}
          </Button>
        </form>
      </Card>

      <Card title="Update status">
        <form onSubmit={handleStatus} className="space-y-4">
          {statusFeedback ? <Alert variant={statusFeedback.type}>{statusFeedback.message}</Alert> : null}
          <Select
            label="Status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ReportStatusValue)}
            options={statusOptions}
          />
          <Button type="submit" fullWidth variant="secondary" loading={savingStatus} loadingText="Updating...">
            Update Status
          </Button>
        </form>
      </Card>

      <Card title="Add update" description="Residents see these updates on their tracking page.">
        <form onSubmit={handleAddUpdate} noValidate className="space-y-4">
          {updateFeedback ? <Alert variant={updateFeedback.type}>{updateFeedback.message}</Alert> : null}
          <Textarea
            label="Update"
            name="comment"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Technician has arrived at the site."
            error={updateErrors.comment}
          />
          <Select
            label="Also change status to"
            name="updateStatus"
            value={updateStatus}
            onChange={(event) => setUpdateStatus(event.target.value as ReportStatusValue | "")}
            options={statusOptions.filter((option) => option.value !== currentStatus)}
            placeholder={`Keep current status (${REPORT_STATUS_LABELS[currentStatus]})`}
          />
          <Button type="submit" fullWidth variant="success" loading={addingUpdate} loadingText="Saving...">
            Add Update
          </Button>
        </form>
      </Card>

      <div className="rounded-xl border border-red-200 bg-white p-4">
        {deleteError ? <Alert variant="error" className="mb-3">{deleteError}</Alert> : null}
        <p className="text-sm font-semibold text-navy">Delete report</p>
        <p className="mt-0.5 text-xs text-muted">For duplicates or test reports. To stop work, set the status to Cancelled instead.</p>
        <Button variant="danger" size="sm" className="mt-3" onClick={handleDelete} loading={deleting} loadingText="Deleting...">
          Delete report
        </Button>
      </div>
    </div>
  );
}
