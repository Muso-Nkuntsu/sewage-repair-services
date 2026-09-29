import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-navy text-slate-300">
      <div className="page-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-3 max-w-sm text-sm">
            Prevention, responsiveness and repair for blocked drains, burst pipes and sewage overflows in
            Khayelitsha, Cape Town.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Residents</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/report" className="hover:text-white">
                Report an Issue
              </Link>
            </li>
            <li>
              <Link href="/my-reports" className="hover:text-white">
                Track a Report
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white">
                Create an account
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Khayelitsha, Cape Town</li>
            <li>Emergencies: report online and we respond as soon as a team is free</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="page-container py-4 text-xs text-slate-400">
          © {year} Sewage Repair Service. A student entrepreneurship prototype — not affiliated with the City of Cape
          Town.
        </p>
      </div>
    </footer>
  );
}
