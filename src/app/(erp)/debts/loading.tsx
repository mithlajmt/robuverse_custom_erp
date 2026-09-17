export default function DebtsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-3 w-28 bg-slate-200/80 rounded-md" />
        <div className="h-8 w-60 bg-slate-300/80 rounded-xl mt-2" />
        <div className="h-4 w-96 bg-slate-200/60 rounded-md mt-2" />
      </div>

      {/* Debt Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="h-4 w-28 bg-slate-200/80 rounded" />
            <div className="h-7 w-40 bg-slate-300/80 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="h-5 w-40 bg-slate-300/80 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 border-b border-slate-100">
              <div className="h-4 w-48 bg-slate-300/70 rounded" />
              <div className="h-4 w-24 bg-slate-200/70 rounded" />
              <div className="h-6 w-20 bg-slate-100 rounded-full border border-slate-200/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
