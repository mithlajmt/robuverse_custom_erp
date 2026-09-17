export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-64 bg-slate-300/80 rounded-xl" />
          <div className="h-4 w-96 bg-slate-200/60 rounded mt-2" />
        </div>
      </div>

      {/* Finance Cards Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="h-3 w-20 bg-slate-200/80 rounded" />
              <div className="h-8 w-8 bg-slate-100 rounded-lg shrink-0 border border-slate-200/60" />
            </div>
            <div className="mt-4">
              <div className="h-7 w-32 bg-slate-300/80 rounded-md" />
              <div className="h-3 w-24 bg-slate-200/60 rounded mt-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions List Skeleton */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 w-40 bg-slate-300/80 rounded" />
            <div className="h-4 w-16 bg-slate-200/70 rounded" />
          </div>

          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-slate-300/70 rounded" />
                  <div className="h-3 w-24 bg-slate-200/50 rounded" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-6 w-20 bg-slate-100 rounded-full border border-slate-200/60" />
                  <div className="h-4 w-16 bg-slate-300/70 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Recording Panel Skeleton */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="h-5 w-36 bg-slate-300/80 rounded" />
          <div className="h-4 w-48 bg-slate-200/60 rounded" />
          <div className="space-y-3 pt-4">
            <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200/60" />
            <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200/60" />
            <div className="h-10 w-full bg-slate-100 rounded-xl border border-slate-200/60" />
            <div className="h-12 w-full bg-indigo-50 border border-indigo-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
