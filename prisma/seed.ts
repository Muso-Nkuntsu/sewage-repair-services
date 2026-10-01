/**
 * Demo data for the Sewage Repair Service.
 * Run with:  npm run db:seed   (or: npx prisma db seed)
 *
 * The seed wipes existing data first, so it can be re-run safely.
 */
import { PrismaClient, type IssueType, type ReportStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function ago(ms: number): Date {
  return new Date(Date.now() - ms);
}

function fromNow(ms: number): Date {
  return new Date(Date.now() + ms);
}

type SeedUpdate = { status: ReportStatus; comment: string; at: Date };

type SeedReport = {
  referenceNumber: number;
  issueType: IssueType;
  location: string;
  landmark: string;
  description: string;
  status: ReportStatus;
  residentEmail: string;
  teamName: string | null;
  eta: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  updates: SeedUpdate[];
};

const DEMO_ADMIN_EMAIL = "admin@sewage.local";

async function main() {
  console.log("Clearing existing data...");
  await prisma.repairUpdate.deleteMany();
  await prisma.report.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.team.deleteMany();
  // Remove residents and the demo admin, but KEEP any other admin accounts
  // (e.g. ones created with `npm run create-admin`), so re-seeding never locks you out.
  await prisma.user.deleteMany({
    where: { OR: [{ role: "RESIDENT" }, { email: DEMO_ADMIN_EMAIL }] },
  });
  const keptAdmins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
  if (keptAdmins.length > 0) {
    console.log(`Kept admin accounts: ${keptAdmins.map((admin) => admin.email).join(", ")}`);
  }

  console.log("Creating users...");
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const residentPassword = await bcrypt.hash("Resident123!", 10);

  await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: DEMO_ADMIN_EMAIL,
      phoneNumber: "021 555 0100",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const residents = [
    { firstName: "Nomsa", lastName: "Dlamini", email: "resident1@sewage.local", phoneNumber: "071 234 5678" },
    { firstName: "Sipho", lastName: "Ndlovu", email: "resident2@sewage.local", phoneNumber: "072 345 6789" },
    { firstName: "Lwazi", lastName: "Mahlangu", email: "resident3@sewage.local", phoneNumber: "073 456 7890" },
  ];

  const residentIds = new Map<string, number>();
  for (const resident of residents) {
    const created = await prisma.user.create({
      data: { ...resident, password: residentPassword, role: "RESIDENT" },
    });
    residentIds.set(created.email, created.id);
  }

  console.log("Creating teams...");
  const teams = [
    { name: "Team A", contactNumber: "021 555 0101", technicianCount: 2, status: "ON_DUTY" as const },
    { name: "Team B", contactNumber: "021 555 0102", technicianCount: 2, status: "ON_DUTY" as const },
    { name: "Team C", contactNumber: "021 555 0103", technicianCount: 3, status: "OFF_DUTY" as const },
  ];
  const teamIds = new Map<string, number>();
  for (const team of teams) {
    const created = await prisma.team.create({ data: team });
    teamIds.set(created.name, created.id);
  }

  console.log("Creating reports and repair updates...");
  const reports: SeedReport[] = [
    {
      referenceNumber: 201,
      issueType: "BLOCKED_DRAIN",
      location: "Site B, Khayelitsha",
      landmark: "Behind the community hall",
      description: "Storm drain is completely blocked and dirty water is pooling on the road.",
      status: "RESOLVED",
      residentEmail: "resident1@sewage.local",
      teamName: "Team A",
      eta: "1 hour",
      createdAt: ago(6 * DAY),
      resolvedAt: ago(6 * DAY - 4 * HOUR),
      updates: [
        { status: "REPORTED", comment: "Report received", at: ago(6 * DAY) },
        { status: "ASSIGNED", comment: "Assigned to Team A", at: ago(6 * DAY - 30 * 60 * 1000) },
        { status: "IN_PROGRESS", comment: "Team A is clearing the blockage", at: ago(6 * DAY - 2 * HOUR) },
        { status: "RESOLVED", comment: "Drain cleared and area cleaned", at: ago(6 * DAY - 4 * HOUR) },
      ],
    },
    {
      referenceNumber: 202,
      issueType: "BURST_PIPE",
      location: "Harare, Khayelitsha",
      landmark: "Near Kuyasa station",
      description: "A sewer pipe has burst next to the pavement. Strong smell and water running into the street.",
      status: "RESOLVED",
      residentEmail: "resident2@sewage.local",
      teamName: "Team B",
      eta: "2 hours",
      createdAt: ago(3 * DAY),
      resolvedAt: ago(3 * DAY - 5 * HOUR),
      updates: [
        { status: "REPORTED", comment: "Report received", at: ago(3 * DAY) },
        { status: "ASSIGNED", comment: "Assigned to Team B", at: ago(3 * DAY - 40 * 60 * 1000) },
        { status: "IN_PROGRESS", comment: "Pipe section being replaced", at: ago(3 * DAY - 2 * HOUR) },
        { status: "RESOLVED", comment: "New pipe section fitted and tested", at: ago(3 * DAY - 5 * HOUR) },
      ],
    },
    {
      referenceNumber: 203,
      issueType: "BLOCKED_DRAIN",
      location: "Makhaza, Khayelitsha",
      landmark: "Opposite the primary school gate",
      description: "Manhole is overflowing after the blockage. Children walk past here every day.",
      status: "IN_PROGRESS",
      residentEmail: "resident3@sewage.local",
      teamName: "Team A",
      eta: "1 hour",
      createdAt: ago(5 * HOUR),
      resolvedAt: null,
      updates: [
        { status: "REPORTED", comment: "Report received", at: ago(5 * HOUR) },
        { status: "ASSIGNED", comment: "Assigned to Team A", at: ago(4 * HOUR) },
        { status: "IN_PROGRESS", comment: "Team A on site, jetting the line", at: ago(2 * HOUR) },
      ],
    },
    {
      referenceNumber: 204,
      issueType: "BURST_PIPE",
      location: "Site C, Khayelitsha",
      landmark: "Next to the taxi rank",
      description: "Leaking sewer pipe at the corner. It has been getting worse since yesterday.",
      status: "ASSIGNED",
      residentEmail: "resident2@sewage.local",
      teamName: "Team B",
      eta: "2 hours",
      createdAt: ago(3 * HOUR),
      resolvedAt: null,
      updates: [
        { status: "REPORTED", comment: "Report received", at: ago(3 * HOUR) },
        { status: "ASSIGNED", comment: "Assigned to Team B", at: ago(2 * HOUR) },
      ],
    },
    {
      referenceNumber: 205,
      issueType: "SEWAGE_OVERFLOW",
      location: "Site C, Harare",
      landmark: "Near the corner shop",
      description: "Sewage overflowing near the corner shop. It is running down the street towards the houses.",
      status: "IN_PROGRESS",
      residentEmail: "resident1@sewage.local",
      teamName: "Team B",
      eta: "45 minutes",
      createdAt: ago(90 * 60 * 1000),
      resolvedAt: null,
      updates: [
        { status: "REPORTED", comment: "Report received", at: ago(90 * 60 * 1000) },
        { status: "ASSIGNED", comment: "Assigned to Team B", at: ago(69 * 60 * 1000) },
        { status: "ASSIGNED", comment: "Team B is on the way", at: ago(54 * 60 * 1000) },
        { status: "IN_PROGRESS", comment: "Repair in progress", at: ago(19 * 60 * 1000) },
      ],
    },
    {
      referenceNumber: 206,
      issueType: "SEWAGE_OVERFLOW",
      location: "Ext. 12, Khayelitsha",
      landmark: "Near local spaza shop",
      description: "Sewage is coming up through the drain in front of the spaza shop.",
      status: "REPORTED",
      residentEmail: "resident3@sewage.local",
      teamName: null,
      eta: null,
      createdAt: ago(40 * 60 * 1000),
      resolvedAt: null,
      updates: [{ status: "REPORTED", comment: "Report received", at: ago(40 * 60 * 1000) }],
    },
    {
      referenceNumber: 207,
      issueType: "OTHER",
      location: "Town Two, Khayelitsha",
      landmark: "Outside the clinic",
      description: "Manhole cover is missing and the opening is a danger to people walking past.",
      status: "REPORTED",
      residentEmail: "resident2@sewage.local",
      teamName: null,
      eta: null,
      createdAt: ago(15 * 60 * 1000),
      resolvedAt: null,
      updates: [{ status: "REPORTED", comment: "Report received", at: ago(15 * 60 * 1000) }],
    },
  ];

  for (const report of reports) {
    const residentId = residentIds.get(report.residentEmail);
    if (!residentId) throw new Error(`Unknown resident ${report.residentEmail}`);
    const assignedTeamId = report.teamName ? teamIds.get(report.teamName) ?? null : null;
    const lastUpdate = report.updates[report.updates.length - 1];

    await prisma.report.create({
      data: {
        referenceNumber: report.referenceNumber,
        issueType: report.issueType,
        location: report.location,
        landmark: report.landmark,
        description: report.description,
        status: report.status,
        residentId,
        assignedTeamId,
        eta: report.eta,
        resolvedAt: report.resolvedAt,
        createdAt: report.createdAt,
        updatedAt: lastUpdate ? lastUpdate.at : report.createdAt,
        repairUpdates: {
          create: report.updates.map((update) => ({
            status: update.status,
            comment: update.comment,
            createdAt: update.at,
          })),
        },
      },
    });
  }

  console.log("Creating inspections...");
  await prisma.inspection.createMany({
    data: [
      {
        location: "Ext. 12, Khayelitsha",
        inspectionDate: ago(2 * HOUR),
        inspectorName: "Team A",
        findings: "Blocked drain discovered near the spaza shop. Needs clearing.",
        status: "ISSUE_FOUND",
      },
      {
        location: "Site B, Khayelitsha",
        inspectionDate: ago(7 * DAY),
        inspectorName: "Team A",
        findings: "All manholes and drains flowing normally.",
        status: "COMPLETED",
      },
      {
        location: "Makhaza, Khayelitsha",
        inspectionDate: ago(1 * DAY),
        inspectorName: "Team B",
        findings: "Minor debris removed from two drains. No damage found.",
        status: "COMPLETED",
      },
      {
        location: "Harare, Khayelitsha",
        inspectionDate: fromNow(2 * DAY),
        inspectorName: "Team B",
        findings: null,
        status: "SCHEDULED",
      },
      {
        location: "Site C, Khayelitsha",
        inspectionDate: fromNow(7 * DAY),
        inspectorName: "Team C",
        findings: null,
        status: "SCHEDULED",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("  Admin:     admin@sewage.local / Admin123!");
  console.log("  Residents: resident1@sewage.local, resident2@sewage.local, resident3@sewage.local / Resident123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
