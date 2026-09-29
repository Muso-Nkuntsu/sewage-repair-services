import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeamsManager, type TeamRow } from "@/components/admin/TeamsManager";

export const metadata: Metadata = { title: "Teams" };

export default async function TeamsPage() {
  await requireAdmin();

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { reports: { where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } } } },
    },
  });

  const rows: TeamRow[] = teams.map((team) => ({
    id: team.id,
    name: team.name,
    contactNumber: team.contactNumber,
    technicianCount: team.technicianCount,
    status: team.status,
    activeJobs: team._count.reports,
  }));

  const onDuty = rows.filter((team) => team.status === "ON_DUTY").length;
  const technicians = rows
    .filter((team) => team.status === "ON_DUTY")
    .reduce((sum, team) => sum + team.technicianCount, 0);

  return (
    <div className="page-container py-8 sm:py-10">
      <PageHeader
        title="Teams"
        description={`${onDuty} of ${rows.length} teams on duty · ${technicians} technicians available`}
      />
      <TeamsManager teams={rows} />
    </div>
  );
}
