export default function LeadsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-3 w-28 bg-slate-200/80 rounded-md" />
        <div className="h-8 w-60 bg-slate-300/80 rounded-xl mt-2" />
        <div className="h-4 w-96 bg-slate-200/60 rounded-md mt-2" />
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="h-3 w-20 bg-slate-200/80 rounded" />
            <div className="h-7 w-32 bg-slate-300/80 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Kanban Columns Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="h-5 w-32 bg-slate-300/80 rounded-lg" />
            <div className="h-32 bg-slate-100 rounded-xl border border-slate-200/60" />
            <div className="h-32 bg-slate-100 rounded-xl border border-slate-200/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
