import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "@/app/actions/auth";
import { auth } from "@/auth";

const dashboardPlaceholders = [
  "Today's Actions",
  "Priority Queue",
  "Progress Insight",
  "Bottleneck Indicator",
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
              Stride
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Signed in as {session.user.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/applications"
            >
              Applications
            </Link>
            <form action={logout}>
              <button
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                type="submit"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-8 md:grid-cols-2 xl:grid-cols-4">
          {dashboardPlaceholders.map((title) => (
            <section
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={title}
            >
              <h2 className="text-base font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Application management is ready. This card will use tracked
                applications when the action dashboard is implemented.
              </p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
