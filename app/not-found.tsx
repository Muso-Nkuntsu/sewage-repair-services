import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="page-container flex flex-col items-center py-24 text-center">
      <p className="font-mono text-sm font-bold text-brand">404</p>
      <h1 className="mt-2 text-3xl font-bold text-navy">Page or report not found</h1>
      <p className="mt-2 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Link href="/" className={buttonClasses("primary", "md", "mt-6")}>
        Go home
      </Link>
    </div>
  );
}
