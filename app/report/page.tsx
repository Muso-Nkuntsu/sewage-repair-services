import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReportForm } from "@/components/reports/ReportForm";
import { ISSUE_TYPES, type IssueTypeValue } from "@/lib/constants";

export const metadata: Metadata = { title: "Report an Issue" };

type ReportPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value.slice(0, 2000) : undefined;
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const user = await requireUser();
  const params = await searchParams;

  // Admins arrive here from an inspection with the details pre-filled.
  const issueParam = single(params.issueType);
  const issueType = ISSUE_TYPES.includes(issueParam as IssueTypeValue) ? (issueParam as IssueTypeValue) : undefined;
  const fromInspection = user.role === "ADMIN" && single(params.from) === "inspection";

  return (
    <div className="page-container max-w-3xl py-8 sm:py-10">
      <PageHeader
        title="Report an Issue"
        description={
          fromInspection
            ? "Create a repair job from an inspection finding. Details have been filled in from the inspection."
            : "Tell us what's wrong and where. Our team will be notified straight away."
        }
        backHref={user.role === "ADMIN" ? (fromInspection ? "/admin/inspections" : "/admin") : "/dashboard"}
        backLabel={fromInspection ? "Back to inspections" : "Back to dashboard"}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <ReportForm
          trackBasePath={user.role === "ADMIN" ? "/admin/reports" : "/reports"}
          defaults={{
            issueType,
            location: single(params.location),
            landmark: single(params.landmark),
            description: single(params.description),
            contactPhone: user.role === "RESIDENT" ? user.phoneNumber ?? undefined : undefined,
          }}
        />
      </div>
    </div>
  );
}
