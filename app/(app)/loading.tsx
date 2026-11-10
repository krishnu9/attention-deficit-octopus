import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-36" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-44 w-full" />
    </div>
  );
}
