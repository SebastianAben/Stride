import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  createChecklistItem,
  deleteApplication,
  deleteChecklistItem,
  getApplication,
  updateChecklistItem,
} from "@/app/actions/applications";
import { auth } from "@/auth";
import { ChecklistEditor } from "@/components/applications/checklist-editor";
import { DeleteApplicationForm } from "@/components/applications/delete-application-form";
import {
  formatDateDisplay,
  toApplicationFormValues,
} from "@/components/applications/format";
import type {
  ApplicationFormState,
} from "@/components/applications/types";

type ApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabels = {
  SAVED: "Saved",
  APPLIED: "Applied",
  ONLINE_TEST: "Online test",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  GHOSTED: "Ghosted",
} as const;

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  const values = toApplicationFormValues(application);

  async function deleteApplicationFromForm(
    state: ApplicationFormState,
    formData: FormData,
  ): Promise<ApplicationFormState> {
    "use server";

    void state;
    void formData;

    const result = await deleteApplication(id);

    if (result.ok) {
      redirect("/applications");
    }

    return {
      error: result.error,
      fieldErrors: result.errors,
    };
  }

  async function createChecklistItemFromForm(
    state: ApplicationFormState,
    formData: FormData,
  ): Promise<ApplicationFormState> {
    "use server";

    void state;

    const result = await createChecklistItem(id, formData);

    if (result.ok) {
      redirect(`/applications/${id}`);
    }

    return { error: result.error, fieldErrors: result.errors };
  }

  async function updateChecklistItemFromForm(
    itemId: string,
    state: ApplicationFormState,
    formData: FormData,
  ): Promise<ApplicationFormState> {
    "use server";

    void state;

    const result = await updateChecklistItem(itemId, formData);

    if (result.ok) {
      redirect(`/applications/${id}`);
    }

    return { error: result.error, fieldErrors: result.errors };
  }

  async function deleteChecklistItemFromForm(
    itemId: string,
    state: ApplicationFormState,
    formData: FormData,
  ): Promise<ApplicationFormState> {
    "use server";

    void state;
    void formData;

    const result = await deleteChecklistItem(itemId);

    if (result.ok) {
      redirect(`/applications/${id}`);
    }

    return { error: result.error, fieldErrors: result.errors };
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <Link
              className="text-sm font-medium text-teal-700 hover:text-teal-900"
              href="/applications"
            >
              Back to applications
            </Link>
            <h1 className="mt-4 text-2xl font-semibold text-slate-950">
              {values.jobTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {values.companyName}
            </p>
          </div>
          <Link
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            href={`/applications/${id}/edit`}
          >
            Edit
          </Link>
        </header>

        <div className="grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <dl className="grid gap-4 sm:grid-cols-2">
              <ApplicationDetail
                label="Status"
                value={statusLabels[values.status]}
              />
              <ApplicationDetail label="Source" value={values.source} />
              <ApplicationDetail label="Location" value={values.location} />
              <ApplicationDetail label="Work type" value={values.workType} />
              <ApplicationDetail
                label="Date applied"
                value={formatDateDisplay(application.dateApplied)}
              />
              <ApplicationDetail
                label="Deadline"
                value={formatDateDisplay(application.deadline)}
              />
              <ApplicationDetail
                label="Follow-up"
                value={formatDateDisplay(application.followUpDate)}
              />
              <ApplicationDetail label="Job URL" value={values.jobUrl} />
            </dl>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <h2 className="text-base font-semibold text-slate-950">Notes</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {values.notes || "No notes recorded."}
              </p>
            </div>

          </section>

          <div className="space-y-6">
            <ChecklistEditor
              createAction={createChecklistItemFromForm}
              deleteAction={deleteChecklistItemFromForm}
              items={values.checklistItems}
              updateAction={updateChecklistItemFromForm}
            />
            <DeleteApplicationForm
              action={deleteApplicationFromForm}
              applicationId={id}
              applicationLabel={`${values.jobTitle} at ${values.companyName}`}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function ApplicationDetail({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-700">{label}</dt>
      <dd className="mt-1 text-sm text-slate-950">{value || "Not set"}</dd>
    </div>
  );
}
