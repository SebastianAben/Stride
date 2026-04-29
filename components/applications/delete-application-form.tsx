"use client";

import { useActionState, useId, useState } from "react";

import type {
  ApplicationFormAction,
  ApplicationFormState,
} from "@/components/applications/types";

const initialState: ApplicationFormState = {};

type DeleteApplicationFormProps = {
  action: ApplicationFormAction;
  applicationId: string;
  applicationLabel: string;
};

export function DeleteApplicationForm({
  action,
  applicationId,
  applicationLabel,
}: DeleteApplicationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isConfirming, setIsConfirming] = useState(false);
  const confirmationId = useId();

  return (
    <section className="rounded-lg border border-red-200 bg-red-50 p-5">
      <h2 className="text-base font-semibold text-red-950">Delete application</h2>
      <p className="mt-2 text-sm leading-6 text-red-800">
        This removes {applicationLabel} and its checklist items. This action
        cannot be undone.
      </p>

      {isConfirming ? (
        <form action={formAction} className="mt-4 space-y-3">
          <input name="id" type="hidden" value={applicationId} />
          <p className="text-sm font-medium text-red-950" id={confirmationId}>
            Are you sure you want to delete this application?
          </p>
          {state.error ? (
            <p
              aria-live="polite"
              className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-700"
            >
              {state.error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              aria-describedby={confirmationId}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Deleting..." : "Delete application"}
            </button>
            <button
              className="rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              onClick={() => setIsConfirming(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          className="mt-4 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          onClick={() => setIsConfirming(true)}
          type="button"
        >
          Delete application
        </button>
      )}
    </section>
  );
}
