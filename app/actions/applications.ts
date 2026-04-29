"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import {
  createApplicationForUser,
  createChecklistItemForUser,
  deleteApplicationForUser,
  deleteChecklistItemForUser,
  getApplicationForUser,
  getApplicationsForUser,
  updateApplicationForUser,
  updateApplicationStatusForUser,
  updateChecklistItemForUser,
} from "@/lib/applications/service";
import {
  formDataToObject,
  validateApplicationInput,
  validateChecklistInput,
  validateStatusInput,
  type FieldErrors,
} from "@/lib/applications/validation";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; errors?: FieldErrors; error?: string };

const DASHBOARD_PATH = "/dashboard";
const APPLICATIONS_PATH = "/applications";

function revalidateApplications(applicationId?: string) {
  revalidatePath(DASHBOARD_PATH);
  revalidatePath(APPLICATIONS_PATH);

  if (applicationId) {
    revalidatePath(`${APPLICATIONS_PATH}/${applicationId}`);
    revalidatePath(`${APPLICATIONS_PATH}/${applicationId}/edit`);
  }
}

function normalizeActionError(error: unknown): ActionResult<never> {
  if (
    error instanceof Error &&
    [
      "Application not found.",
      "Checklist item not found.",
      "Authentication required.",
    ].includes(error.message)
  ) {
    return {
      ok: false,
      error: error.message,
    };
  }

  console.error("Application action failed", error);

  return {
    ok: false,
    error: "Request failed.",
  };
}

export async function getApplications() {
  const userId = await requireUserId();

  return getApplicationsForUser(userId);
}

export async function getApplication(applicationId: string) {
  const userId = await requireUserId();

  return getApplicationForUser(applicationId, userId);
}

export async function createApplication(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = validateApplicationInput(formDataToObject(formData));

  if (!parsed.success) {
    return { ok: false, errors: parsed.errors };
  }

  try {
    const userId = await requireUserId();
    await createApplicationForUser(userId, parsed.data);
    revalidateApplications();
    return { ok: true, data: undefined };
  } catch (error) {
    return normalizeActionError(error);
  }
}

export async function updateApplication(
  applicationId: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = validateApplicationInput(formDataToObject(formData));

  if (!parsed.success) {
    return { ok: false, errors: parsed.errors };
  }

  try {
    const userId = await requireUserId();
    await updateApplicationForUser(applicationId, userId, parsed.data);
    revalidateApplications(applicationId);
    return { ok: true, data: undefined };
  } catch (error) {
    return normalizeActionError(error);
  }
}

export async function deleteApplication(
  applicationId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    await deleteApplicationForUser(applicationId, userId);
    revalidateApplications(applicationId);
    return { ok: true, data: undefined };
  } catch (error) {
    return normalizeActionError(error);
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = validateStatusInput(formDataToObject(formData));

  if (!parsed.success) {
    return { ok: false, errors: parsed.errors };
  }

  try {
    const userId = await requireUserId();
    await updateApplicationStatusForUser(applicationId, userId, parsed.data);
    revalidateApplications(applicationId);
    return { ok: true, data: undefined };
  } catch (error) {
    return normalizeActionError(error);
  }
}

export async function createChecklistItem(
  applicationId: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = validateChecklistInput(formDataToObject(formData));

  if (!parsed.success) {
    return { ok: false, errors: parsed.errors };
  }

  try {
    const userId = await requireUserId();
    await createChecklistItemForUser(applicationId, userId, parsed.data);
    revalidateApplications(applicationId);
    return { ok: true, data: undefined };
  } catch (error) {
    return normalizeActionError(error);
  }
}

export async function updateChecklistItem(
  checklistItemId: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = validateChecklistInput(formDataToObject(formData));

  if (!parsed.success) {
    return { ok: false, errors: parsed.errors };
  }

  try {
    const userId = await requireUserId();
    await updateChecklistItemForUser(checklistItemId, userId, parsed.data);
    revalidateApplications();
    return { ok: true, data: undefined };
  } catch (error) {
    return normalizeActionError(error);
  }
}

export async function deleteChecklistItem(
  checklistItemId: string,
): Promise<ActionResult> {
  try {
    const userId = await requireUserId();
    await deleteChecklistItemForUser(checklistItemId, userId);
    revalidateApplications();
    return { ok: true, data: undefined };
  } catch (error) {
    return normalizeActionError(error);
  }
}
