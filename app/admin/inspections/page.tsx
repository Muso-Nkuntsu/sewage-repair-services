import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfWeekSAST } from "@/lib/dashboard";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { AlertIcon, CheckIcon, ClockIcon } from "@/components/ui/Icons";
import { InspectionsManager, type InspectionRow } from "@/components/admin/InspectionsManager";

export const metadata: Metadata = { title: "Inspections" };

export default async function InspectionsPage() {
  await requireAdmin();

  const [inspections, teams] = await Promise.all([
    prisma.inspection.findMany({ orderBy: { inspectionDate: "desc" } }),
    prisma.team.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  const rows: InspectionRow[] = inspections.map((inspection) => ({
    id: inspection.id,
    location: inspection.location,
    inspectionDate: inspection.inspectionDate.toISOString(),
    inspectorName: inspection.inspectorName,
    findings: inspection.findings,
    status: inspection.status,
  }));

  const weekStart = startOfWeekSAST();
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisWeek = inspections.filter(
    (inspection) => inspection.inspectionDate >= weekStart && inspection.inspectionDate < weekEnd
  );

  return (
    <div className="page-container py-8 sm:py-10">
      <PageHeader
        title="Inspections"
        description="Prevention starts here: weekly checks that catch problems before they become overflows."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <DashboardCard
          label="Scheduled"
          value={inspections.filter((inspection) => inspection.status === "SCHEDULED").length}
          icon={<ClockIcon className="h-5 w-5" />}
          accent="blue"
        />
        <DashboardCard
          label="Completed this week"
          value={thisWeek.filter((inspection) => inspection.status === "COMPLETED").length}
          icon={<CheckIcon className="h-5 w-5" />}
          accent="green"
        />
        <DashboardCard
          label="Issues found (all time)"
          value={inspections.filter((inspection) => inspection.status === "ISSUE_FOUND").length}
          hint="Create a report from an inspection to dispatch a team"
          icon={<AlertIcon className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <InspectionsManager inspections={rows} teamNames={teams.map((team) => team.name)} />
    </div>
  );
}
