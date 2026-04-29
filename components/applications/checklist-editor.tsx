"use client";

import { useActionState } from "react";

import type {
  ApplicationChecklistItem,
  ApplicationFormAction,
  ApplicationFormState,
} from "@/components/applications/types";

type ChecklistItemAction = (
  itemId: string,
  state: ApplicationFormState,
  formData: FormData,
) => Promise<ApplicationFormState>;

type ChecklistEditorProps = {
  createAction: ApplicationFormAction;
  deleteAction: ChecklistItemAction;
  items: ApplicationChecklistItem[];
  updateAction: ChecklistItemAction;
};

const initialState: ApplicationFormState = {};

export function ChecklistEditor({
  createAction,
  deleteAction,
  items,
  updateAction,
}: ChecklistEditorProps) {
  const [createState, createFormAction, isCreating] = useActionState(
    createAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-950">Checklist</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add and update tasks for this application.
        </p>
      </div>

      <form action={createFormAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="sr-only">New checklist item</span>
          <input
            aria-invalid={Boolean(createState.fieldErrors?.title)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            name="title"
            placeholder="Add checklist item"
            required
            type="text"
          />
        </label>
        <input name="position" type="hidden" value={items.length} />
        <button
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isCreating}
          type="submit"
        >
          {isCreating ? "Adding..." : "Add"}
        </button>
      </form>
      <ActionMessage state={createState} />

      {items.length ? (
        <ul className="mt-5 space-y-3">
          {items.map((item, index) => (
            <ChecklistItemRow
              deleteAction={deleteAction.bind(null, item.id ?? "")}
              index={index}
              item={item}
              key={item.id ?? `${item.title}-${index}`}
              updateAction={updateAction.bind(null, item.id ?? "")}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-md border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-600">
          No checklist items recorded.
        </p>
      )}
    </section>
  );
}

function ChecklistItemRow({
  deleteAction,
  index,
  item,
  updateAction,
}: {
  deleteAction: ApplicationFormAction;
  index: number;
  item: ApplicationChecklistItem;
  updateAction: ApplicationFormAction;
}) {
  const [updateState, updateFormAction, isUpdating] = useActionState(
    updateAction,
    initialState,
  );
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteAction,
    initialState,
  );

  return (
    <li className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <form
        action={updateFormAction}
        className="grid gap-3 sm:grid-cols-[auto_1fr_auto]"
      >
        <input name="position" type="hidden" value={index} />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            defaultChecked={item.isDone}
            name="isDone"
            type="checkbox"
            value="true"
          />
          Done
        </label>
        <label className="block">
          <span className="sr-only">Checklist item {index + 1}</span>
          <input
            aria-invalid={Boolean(updateState.fieldErrors?.title)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            defaultValue={item.title}
            name="title"
            required
            type="text"
          />
        </label>
        <button
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isUpdating}
          type="submit"
        >
          {isUpdating ? "Saving..." : "Save"}
        </button>
      </form>
      <div className="mt-2 flex justify-end">
        <form action={deleteFormAction}>
          <button
            className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
            type="submit"
          >
            {isDeleting ? "Removing..." : "Remove"}
          </button>
        </form>
      </div>
      <ActionMessage state={updateState} />
      <ActionMessage state={deleteState} />
    </li>
  );
}

function ActionMessage({ state }: { state: ApplicationFormState }) {
  const message = state.error ?? state.success;

  if (!message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={
        state.error
          ? "mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          : "mt-2 rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800"
      }
    >
      {message}
    </p>
  );
}
