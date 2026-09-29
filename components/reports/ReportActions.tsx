"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { apiRequest, errorMessage } from "@/lib/client";

/** Re-fetches the page from the server so the latest repair updates appear. */
export function RefreshButton({ label = "Refresh status" }: { label?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      loading={pending}
      loadingText="Refreshing..."
      onClick={() => startTransition(() => router.refresh())}
    >
      {label}
    </Button>
  );
}

/** Lets a resident cancel their own report while it is still waiting for a team. */
export function CancelReportButton({ reportId }: { reportId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!window.confirm("Cancel this report? The repair team will no longer attend to it.")) return;
    setLoading(true);
    setError(null);
    try {
      await apiRequest(`/api/reports/${reportId}`, { method: "PUT", body: { status: "CANCELLED" } });
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error ? <Alert variant="error">{error}</Alert> : null}
      <Button variant="ghost" size="sm" onClick={handleCancel} loading={loading} loadingText="Cancelling..." className="text-red-700">
        Cancel this report
      </Button>
    </div>
  );
}
