export default function TransactionsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div>
        <div className="h-3 w-28 bg-slate-200/80 rounded-md" />
        <div className="h-8 w-60 bg-slate-300/80 rounded-xl mt-2" />
        <div className="h-4 w-96 bg-slate-200/60 rounded-md mt-2" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 bg-slate-200/80 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200/60" />
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Table Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 w-44 bg-slate-300/80 rounded" />
          <div className="h-4 w-24 bg-slate-200/60 rounded" />
        </div>

        <div className="space-y-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3.5 border-b border-slate-100">
              <div className="space-y-2">
                <div className="h-4 w-56 bg-slate-300/70 rounded" />
                <div className="h-3 w-32 bg-slate-200/50 rounded" />
              </div>
              <div className="flex items-center gap-6">
                <div className="h-6 w-24 bg-slate-100 rounded-full border border-slate-200/60" />
                <div className="h-4 w-20 bg-slate-300/70 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
