export default function ErpGlobalLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-3 w-28 bg-slate-200/80 rounded-md" />
        <div className="h-8 w-60 bg-slate-300/80 rounded-xl mt-2" />
        <div className="h-4 w-96 bg-slate-200/60 rounded-md mt-2" />
      </div>

      {/* Main Content Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="h-6 w-48 bg-slate-300/70 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-xl border border-slate-200/60" />
          ))}
        </div>
        <div className="h-40 bg-slate-100 rounded-xl border border-slate-200/60" />
      </div>
    </div>
  );
}
