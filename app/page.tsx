const setupItems = [
  "Next.js App Router",
  "TypeScript strict mode",
  "Tailwind CSS",
  "Prisma foundation",
  "Extension workspace",
  "Docker build target",
];

const nextMilestones = [
  "Auth and PostgreSQL",
  "Rule engine",
  "Application CRUD",
  "Action dashboard",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
              Stride
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Personal job search assistant
            </h1>
          </div>
          <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">
            Phase 1 setup
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.45fr_0.85fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Foundation ready for MVP implementation
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  This shell is intentionally focused on setup. Product logic,
                  auth, database models, dashboard data, and extension behavior
                  are implemented in the next phases from the cache plan.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {setupItems.map((item) => (
                <div
                  className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
                  key={item}
                >
                  <p className="text-sm font-medium text-slate-900">{item}</p>
                  <p className="mt-1 text-xs text-slate-500">Configured</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">
              Next implementation queue
            </h2>
            <ol className="mt-5 space-y-4">
              {nextMilestones.map((milestone, index) => (
                <li className="flex gap-3" key={milestone}>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white">
                    {index + 2}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {milestone}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Pending according to implementation plan
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </main>
  );
}
