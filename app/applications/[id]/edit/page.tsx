import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  getApplication,
  updateApplication,
} from "@/app/actions/applications";
import { auth } from "@/auth";
import { ApplicationForm } from "@/components/applications/application-form";
import { toApplicationFormValues } from "@/components/applications/format";
import type { ApplicationFormState } from "@/components/applications/types";

type EditApplicationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditApplicationPage({
  params,
}: EditApplicationPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  async function updateApplicationFromForm(
    state: ApplicationFormState,
    formData: FormData,
  ): Promise<ApplicationFormState> {
    "use server";

    void state;

    const result = await updateApplication(id, formData);

    if (result.ok) {
      redirect(`/applications/${id}`);
    }

    return {
      error: result.error,
      fieldErrors: result.errors,
    };
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-8 lg:px-10">
        <header className="border-b border-slate-200 pb-5">
          <Link
            className="text-sm font-medium text-teal-700 hover:text-teal-900"
            href={`/applications/${id}`}
          >
            Back to application
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-slate-950">
            Edit application
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Update status, dates, notes, and checklist items for this tracked
            role.
          </p>
        </header>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <ApplicationForm
            action={updateApplicationFromForm}
            application={toApplicationFormValues(application)}
            cancelHref={`/applications/${id}`}
            submitLabel="Save changes"
          />
        </section>
      </section>
    </main>
  );
}
