"use client";

import Link from "next/link";
import { useActionState, useId } from "react";

import type {
  ApplicationFormAction,
  ApplicationFormState,
  ApplicationFormValues,
  ApplicationStatus,
} from "@/components/applications/types";

const statuses: Array<{ value: ApplicationStatus; label: string }> = [
  { value: "SAVED", label: "Saved" },
  { value: "APPLIED", label: "Applied" },
  { value: "ONLINE_TEST", label: "Online test" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "GHOSTED", label: "Ghosted" },
];

const emptyApplication: ApplicationFormValues = {
  jobTitle: "",
  companyName: "",
  status: "SAVED",
  jobUrl: "",
  source: "",
  location: "",
  workType: "",
  dateApplied: "",
  deadline: "",
  followUpDate: "",
  notes: "",
  checklistItems: [],
};

const initialState: ApplicationFormState = {};

type ApplicationFormProps = {
  action: ApplicationFormAction;
  application?: Partial<ApplicationFormValues>;
  cancelHref: string;
  submitLabel: string;
};

export function ApplicationForm({
  action,
  application,
  cancelHref,
  submitLabel,
}: ApplicationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  const values = { ...emptyApplication, ...application };

  return (
    <form action={formAction} className="space-y-6">
      {values.id ? <input name="id" type="hidden" value={values.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FieldError errors={state.fieldErrors?.jobTitle}>
          {(errorId) => (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Job title
              </span>
              <input
                aria-describedby={errorId}
                aria-invalid={Boolean(errorId)}
                autoComplete="organization-title"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                defaultValue={values.jobTitle}
                name="jobTitle"
                required
                type="text"
              />
            </label>
          )}
        </FieldError>

        <FieldError errors={state.fieldErrors?.companyName}>
          {(errorId) => (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Company</span>
              <input
                aria-describedby={errorId}
                aria-invalid={Boolean(errorId)}
                autoComplete="organization"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                defaultValue={values.companyName}
                name="companyName"
                required
                type="text"
              />
            </label>
          )}
        </FieldError>

        <FieldError errors={state.fieldErrors?.status}>
          {(errorId) => (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                aria-describedby={errorId}
                aria-invalid={Boolean(errorId)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                defaultValue={values.status}
                name="status"
                required
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </FieldError>

        <FieldError errors={state.fieldErrors?.jobUrl}>
          {(errorId) => (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Job URL</span>
              <input
                aria-describedby={errorId}
                aria-invalid={Boolean(errorId)}
                autoComplete="url"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                defaultValue={values.jobUrl ?? ""}
                name="jobUrl"
                type="url"
              />
            </label>
          )}
        </FieldError>

        <FieldError errors={state.fieldErrors?.source}>
          {(errorId) => (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Source</span>
              <input
                aria-describedby={errorId}
                aria-invalid={Boolean(errorId)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                defaultValue={values.source ?? ""}
                name="source"
                type="text"
              />
            </label>
          )}
        </FieldError>

        <FieldError errors={state.fieldErrors?.location}>
          {(errorId) => (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Location</span>
              <input
                aria-describedby={errorId}
                aria-invalid={Boolean(errorId)}
                autoComplete="address-level2"
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                defaultValue={values.location ?? ""}
                name="location"
                type="text"
              />
            </label>
          )}
        </FieldError>

        <FieldError errors={state.fieldErrors?.workType}>
          {(errorId) => (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Work type
              </span>
              <input
                aria-describedby={errorId}
                aria-invalid={Boolean(errorId)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                defaultValue={values.workType ?? ""}
                name="workType"
                placeholder="Remote, hybrid, full-time"
                type="text"
              />
            </label>
          )}
        </FieldError>

        <FieldError errors={state.fieldErrors?.dateApplied}>
          {(errorId) => (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Date applied
              </span>
              <input
                aria-describedby={errorId}
                aria-invalid={Boolean(errorId)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                defaultValue={values.dateApplied ?? ""}
                name="dateApplied"
                type="date"
              />
            </label>
          )}
        </FieldError>

        <FieldError errors={state.fieldErrors?.deadline}>
          {(errorId) => (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Deadline
              </span>
              <input
                aria-describedby={errorId}
                aria-invalid={Boolean(errorId)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                defaultValue={values.deadline ?? ""}
                name="deadline"
                type="date"
              />
            </label>
          )}
        </FieldError>

        <FieldError errors={state.fieldErrors?.followUpDate}>
          {(errorId) => (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Follow-up date
              </span>
              <input
                aria-describedby={errorId}
                aria-invalid={Boolean(errorId)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                defaultValue={values.followUpDate ?? ""}
                name="followUpDate"
                type="date"
              />
            </label>
          )}
        </FieldError>
      </div>

      <FieldError errors={state.fieldErrors?.notes}>
        {(errorId) => (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea
              aria-describedby={errorId}
              aria-invalid={Boolean(errorId)}
              className="mt-1 min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              defaultValue={values.notes ?? ""}
              name="notes"
            />
          </label>
        )}
      </FieldError>

      {state.error ? (
        <p
          aria-live="polite"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p
          aria-live="polite"
          className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800"
        >
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <Link
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          href={cancelHref}
        >
          Cancel
        </Link>
        <button
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function FieldError({
  children,
  errors,
}: {
  children: (errorId: string | undefined) => React.ReactNode;
  errors?: string[];
}) {
  const id = useId();
  const errorId = errors?.length ? id : undefined;

  return (
    <div>
      {children(errorId)}
      {errors?.length ? (
        <p className="mt-1 text-sm text-red-700" id={id}>
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
