import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

import {
  isApplicationStatus,
  type ApplicationStatusValue,
} from "./status";
import { parseDateOnly } from "./dates";

export type ApplicationValidationInput = {
  jobTitle: string;
  companyName: string;
  jobUrl: string | null;
  source: string | null;
  location: string | null;
  workType: string | null;
  status: ApplicationStatusValue;
  dateApplied: Date | null;
  deadline: Date | null;
  followUpDate: Date | null;
  notes: string | null;
};

export type ChecklistValidationInput = {
  title: string;
  isDone?: boolean;
  position?: number;
};

export type StatusValidationInput = {
  status: ApplicationStatusValue;
};

export type FieldErrors = Record<string, string[]>;

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: FieldErrors };

const REQUIRED_TEXT_MAX = 200;
const OPTIONAL_TEXT_MAX = 500;
const NOTES_MAX = 5000;

function normalizeOptionalString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

function normalizeRequiredString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (["true", "on", "1"].includes(value)) {
      return true;
    }

    if (["false", "off", "0"].includes(value)) {
      return false;
    }
  }

  return undefined;
}

function normalizePosition(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : undefined;
}

function parseDateField(value: unknown, fieldName: string, errors: FieldErrors) {
  try {
    return parseDateOnly(value);
  } catch (error) {
    errors[fieldName] = [
      error instanceof Error ? error.message : "Invalid date.",
    ];
    return null;
  }
}

function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string") {
      errors[field] = [...(errors[field] ?? []), issue.message];
    }
  }

  return errors;
}

function validateUrl(value: string | null): boolean {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const applicationSchema = z.object({
  jobTitle: z
    .string()
    .min(1, "Job title is required.")
    .max(REQUIRED_TEXT_MAX, "Job title is too long."),
  companyName: z
    .string()
    .min(1, "Company name is required.")
    .max(REQUIRED_TEXT_MAX, "Company name is too long."),
  jobUrl: z
    .string()
    .nullable()
    .refine(validateUrl, "Enter a valid job URL."),
  source: z.string().max(OPTIONAL_TEXT_MAX).nullable(),
  location: z.string().max(OPTIONAL_TEXT_MAX).nullable(),
  workType: z.string().max(OPTIONAL_TEXT_MAX).nullable(),
  status: z.custom<ApplicationStatusValue>(isApplicationStatus, {
    message: "Invalid application status.",
  }),
  dateApplied: z.date().nullable(),
  deadline: z.date().nullable(),
  followUpDate: z.date().nullable(),
  notes: z.string().max(NOTES_MAX, "Notes are too long.").nullable(),
});

const checklistSchema = z.object({
  title: z
    .string()
    .min(1, "Checklist title is required.")
    .max(REQUIRED_TEXT_MAX, "Checklist title is too long."),
  isDone: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

export function validateApplicationInput(
  input: Record<string, unknown>,
  options: { defaultStatus?: ApplicationStatusValue } = {},
): ValidationResult<ApplicationValidationInput> {
  const dateErrors: FieldErrors = {};
  const data = {
    jobTitle: normalizeRequiredString(input.jobTitle),
    companyName: normalizeRequiredString(input.companyName),
    jobUrl: normalizeOptionalString(input.jobUrl),
    source: normalizeOptionalString(input.source),
    location: normalizeOptionalString(input.location),
    workType: normalizeOptionalString(input.workType),
    status:
      input.status === undefined || input.status === null || input.status === ""
        ? options.defaultStatus ?? ApplicationStatus.SAVED
        : input.status,
    dateApplied: parseDateField(input.dateApplied, "dateApplied", dateErrors),
    deadline: parseDateField(input.deadline, "deadline", dateErrors),
    followUpDate: parseDateField(input.followUpDate, "followUpDate", dateErrors),
    notes: normalizeOptionalString(input.notes),
  };

  const parsed = applicationSchema.safeParse(data);

  if (!parsed.success || Object.keys(dateErrors).length > 0) {
    return {
      success: false,
      errors: {
        ...(parsed.success ? {} : toFieldErrors(parsed.error)),
        ...dateErrors,
      },
    };
  }

  return { success: true, data: parsed.data };
}

export function validateChecklistInput(
  input: Record<string, unknown>,
): ValidationResult<ChecklistValidationInput> {
  const parsed = checklistSchema.safeParse({
    title: normalizeRequiredString(input.title),
    isDone: normalizeBoolean(input.isDone),
    position: normalizePosition(input.position),
  });

  if (!parsed.success) {
    return { success: false, errors: toFieldErrors(parsed.error) };
  }

  return { success: true, data: parsed.data };
}

export function validateStatusInput(
  input: Record<string, unknown>,
): ValidationResult<StatusValidationInput> {
  if (!isApplicationStatus(input.status)) {
    return {
      success: false,
      errors: { status: ["Invalid application status."] },
    };
  }

  return { success: true, data: { status: input.status } };
}

export function formDataToObject(formData: FormData): Record<string, unknown> {
  return Object.fromEntries(formData.entries());
}
