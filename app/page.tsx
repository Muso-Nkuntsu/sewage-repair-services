import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import {
  ArrowRightIcon,
  BuildingIcon,
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  HomeIcon,
  MapPinIcon,
  MegaphoneIcon,
  SchoolIcon,
  SearchIcon,
  StoreIcon,
  UsersIcon,
  WrenchIcon,
} from "@/components/ui/Icons";

const pillars = [
  {
    title: "Monitoring",
    subtitle: "Prevention",
    text: "Weekly sewer inspections to identify problems early — before a blocked line becomes an overflow in the street.",
    icon: SearchIcon,
  },
  {
    title: "Reporting",
    subtitle: "Responsiveness",
    text: "Residents can quickly report burst pipes, blocked drains and sewage overflows from any phone.",
    icon: MegaphoneIcon,
  },
  {
    title: "Repair",
    subtitle: "Rapid response",
    text: "A rapid-response team handles reported problems and updates residents as the repair progresses.",
    icon: WrenchIcon,
  },
];

const steps = [
  { title: "Report", text: "Tell us what you see and where — it takes about a minute." },
  { title: "Assigned", text: "A repair team is dispatched and you see who is coming and the ETA." },
  { title: "In progress", text: "The team is on site. Updates appear on your report as work happens." },
  { title: "Resolved", text: "The problem is fixed and the report is closed. You can see the full history." },
];

const services = [
  { title: "Weekly sewer inspections", text: "Scheduled checks of drains and manholes across Khayelitsha." },
  { title: "Blocked drain clearing", text: "Jetting and rodding to get blocked lines flowing again." },
  { title: "Burst pipe repair", text: "Fast isolation and replacement of damaged pipe sections." },
  { title: "Sewage overflow response", text: "Containment, clearing and clean-up after overflows." },
  { title: "Preventative maintenance", text: "Regular maintenance plans for schools and businesses." },
  { title: "Repair follow-ups", text: "We check back after a repair to make sure it holds." },
];

const communities = [
  { title: "Residents", text: "Families living with frequent blockages and overflows.", icon: HomeIcon },
  { title: "Schools", text: "Safe, clean sanitation for learners and staff.", icon: SchoolIcon },
  { title: "Small businesses", text: "Spaza shops and traders who can't afford to close.", icon: StoreIcon },
  { title: "Municipality", text: "Partnering to support existing maintenance services.", icon: BuildingIcon },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="page-container grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
              <MapPinIcon className="h-3.5 w-3.5" /> Khayelitsha, Cape Town
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              A cleaner, healthier Khayelitsha — built one repair at a time.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Report blocked drains, burst sewer pipes and sewage overflows in minutes. Our repair teams respond, and
              you can follow every step until the problem is fixed.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/report" size="lg">
                Report an Issue <ArrowRightIcon className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/my-reports" size="lg" variant="white">
                Track a Report
              </ButtonLink>
            </div>
          </div>

          {/* Tracker preview */}
          <div className="rounded-2xl bg-white p-6 text-navy shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-sm font-bold text-brand">Report #205</p>
                <p className="text-lg font-semibold">Sewage Overflow</p>
                <p className="flex items-center gap-1 text-sm text-muted">
                  <MapPinIcon className="h-4 w-4" /> Site C, Harare
                </p>
              </div>
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold uppercase text-orange-700 ring-1 ring-inset ring-orange-300">
                In Progress
              </span>
            </div>
            <ol className="mt-6 space-y-3 text-sm">
              {[
                { label: "Reported", state: "done" },
                { label: "Assigned — Team B", state: "done" },
                { label: "In Progress", state: "current" },
                { label: "Resolved", state: "todo" },
              ].map((step) => (
                <li key={step.label} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      step.state === "done"
                        ? "bg-success text-white"
                        : step.state === "current"
                          ? "bg-brand-light ring-2 ring-brand"
                          : "border-2 border-slate-300"
                    }`}
                    aria-hidden="true"
                  >
                    {step.state === "done" ? <CheckIcon className="h-3.5 w-3.5" /> : null}
                    {step.state === "current" ? <span className="h-2 w-2 rounded-full bg-brand" /> : null}
                  </span>
                  <span className={step.state === "todo" ? "text-slate-400" : "font-medium"}>{step.label}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
              <div>
                <p className="text-xs text-muted">Technicians</p>
                <p className="font-semibold">2 engineers</p>
              </div>
              <div>
                <p className="text-xs text-muted">ETA</p>
                <p className="flex items-center gap-1 font-semibold">
                  <ClockIcon className="h-4 w-4 text-brand" /> 45 minutes
                </p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted">Example of what residents see when they track a report</p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 sm:py-20">
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Prevention · Responsiveness · Repair</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Three pillars of our service</h2>
            <p className="mt-3 text-muted">
              Frequent blocked drains and sewage overflows affect health, homes and businesses. We tackle them from
              every side.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="inline-flex rounded-lg bg-brand-light p-3 text-brand">
                  <pillar.icon className="h-6 w-6" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{pillar.subtitle}</p>
                <h3 className="text-xl font-bold text-navy">{pillar.title}</h3>
                <p className="mt-2 text-sm text-muted">{pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 bg-brand-light py-16 sm:py-20">
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy">How it works</h2>
            <p className="mt-3 text-muted">From your report to a finished repair, you can see exactly where things stand.</p>
          </div>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title} className="relative rounded-xl bg-white p-6 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold text-navy">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <ButtonLink href="/report" size="lg">
              Report an Issue now
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-20 py-16 sm:py-20">
        <div className="page-container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-navy">Services</h2>
              <p className="mt-3 text-muted">Operational sanitation support focused on keeping sewers flowing.</p>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5">
                <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-green-50 text-success">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-semibold text-navy">{service.title}</h3>
                  <p className="mt-1 text-sm text-muted">{service.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="bg-white py-16 sm:py-20">
        <div className="page-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-success">Community first</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy">Built with and for Khayelitsha</h2>
            <p className="mt-4 text-muted">
              Every report from a resident helps us find problems faster and plan inspections where they are needed
              most. We work alongside residents, schools, small businesses and the municipality to keep streets
              clean and safe.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-navy">
              <li className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-brand" /> Community engagement and awareness
              </li>
              <li className="flex items-center gap-2">
                <ClipboardIcon className="h-5 w-5 text-brand" /> Transparent status updates on every job
              </li>
              <li className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-brand" /> Faster response through early reporting
              </li>
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {communities.map((group) => (
              <div key={group.title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <group.icon className="h-6 w-6 text-brand" />
                <h3 className="mt-3 font-semibold text-navy">{group.title}</h3>
                <p className="mt-1 text-sm text-muted">{group.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="page-container">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand px-6 py-10 text-white sm:flex-row sm:items-center sm:px-10">
            <div>
              <h2 className="text-2xl font-bold">Seen a blocked drain or sewage overflow?</h2>
              <p className="mt-1 text-blue-100">Report it now — it takes about a minute.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/report" variant="white" size="lg">
                Report an Issue
              </ButtonLink>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
