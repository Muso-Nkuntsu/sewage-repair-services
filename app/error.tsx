"use client";

import { Button } from "@/components/ui/Button";

// Friendly fallback for unexpected server errors (e.g. MySQL not running).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-container flex flex-col items-center py-24 text-center">
      <h1 className="text-3xl font-bold text-navy">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted">
        We couldn&apos;t load this page. If you are running the app locally, check that MySQL is running and that
        DATABASE_URL in your .env file is correct.
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
