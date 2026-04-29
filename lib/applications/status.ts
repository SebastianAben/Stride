import { ApplicationStatus } from "@prisma/client";

export type ApplicationStatusValue =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

const APPLIED_STAGE_STATUSES = new Set<ApplicationStatusValue>([
  ApplicationStatus.APPLIED,
  ApplicationStatus.ONLINE_TEST,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
  ApplicationStatus.GHOSTED,
]);

export type StatusTransitionInput = {
  currentStatus: ApplicationStatusValue;
  nextStatus: ApplicationStatusValue;
  currentDateApplied?: Date | null;
  currentLastStatusUpdateDate: Date;
  nextDateApplied?: Date | null;
  now?: Date;
};

export type StatusTransitionResult = {
  status: ApplicationStatusValue;
  dateApplied?: Date | null;
  lastStatusUpdateDate: Date;
};

export function isApplicationStatus(value: unknown): value is ApplicationStatusValue {
  return (
    typeof value === "string" &&
    Object.values(ApplicationStatus).includes(value as ApplicationStatusValue)
  );
}

export function resolveStatusTransition({
  currentStatus,
  nextStatus,
  currentDateApplied = null,
  currentLastStatusUpdateDate,
  nextDateApplied,
  now = new Date(),
}: StatusTransitionInput): StatusTransitionResult {
  const statusChanged = currentStatus !== nextStatus;
  const resolvedDateApplied =
    nextDateApplied !== undefined ? nextDateApplied : currentDateApplied;

  return {
    status: nextStatus,
    dateApplied:
      statusChanged &&
      currentStatus === ApplicationStatus.SAVED &&
      APPLIED_STAGE_STATUSES.has(nextStatus) &&
      !resolvedDateApplied
        ? now
        : resolvedDateApplied,
    lastStatusUpdateDate: statusChanged ? now : currentLastStatusUpdateDate,
  };
}
