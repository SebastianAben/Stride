import Link from "next/link";
import { redirect } from "next/navigation";

import { createApplication } from "@/app/actions/applications";
import { auth } from "@/auth";
import { ApplicationForm } from "@/components/applications/application-form";
import type { ApplicationFormState } from "@/components/applications/types";

async function createApplicationFromForm(
  state: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  "use server";

  void state;

  const result = await createApplication(formData);

  if (result.ok) {
    redirect("/applications");
  }

  return {
    error: result.error,
    fieldErrors: result.errors,
  };
}

export default async function NewApplicationPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-8 lg:px-10">
        <header className="border-b border-slate-200 pb-5">
          <Link
            className="text-sm font-medium text-teal-700 hover:text-teal-900"
            href="/applications"
          >
            Back to applications
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">
            New application
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Capture the role details, timing, and checklist work needed to move
            this application forward.
          </p>
        </header>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <ApplicationForm
            action={createApplicationFromForm}
            cancelHref="/applications"
            submitLabel="Create application"
          />
        </section>
      </section>
    </main>
  );
}
