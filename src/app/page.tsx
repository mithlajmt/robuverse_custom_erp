export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Learning rebuild</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
        Start your ERP from scratch.
      </h1>
      <p className="mt-4 text-base leading-7 text-slate-600">
        This branch is now a clean Next.js starting point. Build routing, layout,
        Supabase auth, Prisma access, and ERP screens one piece at a time.
      </p>
    </main>
  );
}
