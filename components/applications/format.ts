import type { ApplicationFormValues } from "@/components/applications/types";

type ApplicationRecord = {
  id: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationFormValues["status"];
  jobUrl: string | null;
  source: string | null;
  location: string | null;
  workType: string | null;
  dateApplied: Date | string | null;
  deadline: Date | string | null;
  followUpDate: Date | string | null;
  notes: string | null;
  checklistItems?: Array<{
    id: string;
    title: string;
    isDone: boolean;
  }>;
};

export function formatDateInput(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function formatDateDisplay(value: Date | string | null | undefined) {
  const dateInput = formatDateInput(value);

  if (!dateInput) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${dateInput}T00:00:00.000Z`));
}

export function toApplicationFormValues(
  application: ApplicationRecord,
): ApplicationFormValues {
  return {
    id: application.id,
    jobTitle: application.jobTitle,
    companyName: application.companyName,
    status: application.status,
    jobUrl: application.jobUrl,
    source: application.source,
    location: application.location,
    workType: application.workType,
    dateApplied: formatDateInput(application.dateApplied),
    deadline: formatDateInput(application.deadline),
    followUpDate: formatDateInput(application.followUpDate),
    notes: application.notes,
    checklistItems:
      application.checklistItems?.map((item) => ({
        id: item.id,
        title: item.title,
        isDone: item.isDone,
      })) ?? [],
  };
}
