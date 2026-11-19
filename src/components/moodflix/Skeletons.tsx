import { cn } from "@/lib/utils";

export function Shimmer({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-md", className)} />;
}

export function TitleCardSkeleton() {
  return (
    <div className="space-y-3">
      <Shimmer className="aspect-[2/3] w-full rounded-lg" />
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-3 w-1/2" />
    </div>
  );
}

export function TitleGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }, (_, i) => (
        <TitleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:px-8">
      <Shimmer className="h-10 w-1/3" />
      <Shimmer className="h-4 w-1/2" />
      <TitleGridSkeleton count={5} />
    </div>
  );
}
