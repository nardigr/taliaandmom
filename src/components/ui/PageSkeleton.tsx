export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-10 w-64 rounded-lg bg-cream" />
      <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="aspect-[3/4] rounded-lg bg-cream" />
            <div className="h-4 w-3/4 rounded bg-cream" />
            <div className="h-4 w-1/3 rounded bg-cream" />
          </div>
        ))}
      </div>
    </div>
  );
}
