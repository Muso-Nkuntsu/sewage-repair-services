import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24 text-brand">
      <LoadingSpinner size="lg" label="Loading page" />
    </div>
  );
}
