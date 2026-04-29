import Link from "next/link";
import { redirect } from "next/navigation";

import { getApplications } from "@/app/actions/applications";
import { auth } from "@/auth";
import { formatDateDisplay } from "@/components/applications/format";
import type { ApplicationSummary } from "@/components/applications/types";

const statusLabels: Record<ApplicationSummary["status"], string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  ONLINE_TEST: "Online test",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
};

export default async function ApplicationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const applications = await getApplications();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-medium uppercase text-teal-700">
              Applications
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              Job application tracker
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Track saved roles, submitted applications, deadlines, follow-ups,
              and checklist work.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/applications/new"
            >
              New application
            </Link>
          </div>
        </header>

        <div className="py-8">
          {applications.length ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[760px] text-left text-sm">
                <caption className="sr-only">Tracked job applications</caption>
                <thead className="border-b border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3" scope="col">
                      Role
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Status
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Location
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Deadline
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Follow-up
                    </th>
                    <th className="px-4 py-3" scope="col">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">
                          {application.jobTitle}
                        </p>
                        <p className="mt-1 text-slate-600">
                          {application.companyName}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {statusLabels[application.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {application.location || "Not set"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                          {formatDateDisplay(application.deadline) || "Not set"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                          {formatDateDisplay(application.followUpDate) ||
                            "Not set"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          className="font-medium text-teal-700 hover:text-teal-900"
                          href={`/applications/${application.id}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <section className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">
                No applications yet
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Add your first application to start tracking deadlines,
                follow-ups, checklist items, and progress through each stage.
              </p>
              <Link
                className="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                href="/applications/new"
              >
                New application
              </Link>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
