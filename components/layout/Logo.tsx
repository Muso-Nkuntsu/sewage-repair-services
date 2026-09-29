import Link from "next/link";
import { DropletIcon } from "@/components/ui/Icons";

export function Logo({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="Sewage Repair Service home">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
        <DropletIcon className="h-5 w-5" />
      </span>
      <span className={`text-base font-bold leading-tight ${light ? "text-white" : "text-navy"}`}>
        Sewage Repair
        <span className={`block text-xs font-medium ${light ? "text-slate-300" : "text-muted"}`}>Service · Khayelitsha</span>
      </span>
    </Link>
  );
}
