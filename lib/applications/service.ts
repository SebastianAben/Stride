import { ApplicationStatus, type Prisma } from "@prisma/client";

import { assertApplicationOwner } from "@/lib/auth/ownership";
import { prisma } from "@/lib/db/prisma";
import { resolveStatusTransition } from "./status";
import type {
  ApplicationValidationInput,
  ChecklistValidationInput,
  StatusValidationInput,
} from "./validation";

export type ApplicationWithChecklist = Prisma.ApplicationGetPayload<{
  include: { checklistItems: { orderBy: { position: "asc" } } };
}>;

export async function getApplicationsForUser(
  userId: string,
): Promise<ApplicationWithChecklist[]> {
  return prisma.application.findMany({
    where: { userId },
    include: { checklistItems: { orderBy: { position: "asc" } } },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getApplicationForUser(applicationId: string, userId: string) {
  return prisma.application.findFirst({
    where: { id: applicationId, userId },
    include: { checklistItems: { orderBy: { position: "asc" } } },
  });
}

export async function createApplicationForUser(
  userId: string,
  input: ApplicationValidationInput,
): Promise<ApplicationWithChecklist> {
  const now = new Date();

  return prisma.application.create({
    data: {
      userId,
      jobTitle: input.jobTitle,
      companyName: input.companyName,
      jobUrl: input.jobUrl,
      source: input.source,
      location: input.location,
      workType: input.workType,
      status: ApplicationStatus.SAVED,
      dateSaved: now,
      dateApplied: input.dateApplied,
      deadline: input.deadline,
      followUpDate: input.followUpDate,
      lastStatusUpdateDate: now,
      notes: input.notes,
    },
    include: { checklistItems: { orderBy: { position: "asc" } } },
  });
}

export async function updateApplicationForUser(
  applicationId: string,
  userId: string,
  input: ApplicationValidationInput,
): Promise<ApplicationWithChecklist> {
  const existing = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: {
      id: true,
      status: true,
      dateApplied: true,
      lastStatusUpdateDate: true,
    },
  });

  if (!existing) {
    throw new Error("Application not found.");
  }

  const transition = resolveStatusTransition({
    currentStatus: existing.status,
    nextStatus: input.status,
    currentDateApplied: existing.dateApplied,
    currentLastStatusUpdateDate: existing.lastStatusUpdateDate,
    nextDateApplied: input.dateApplied,
  });

  return prisma.application.update({
    where: { id: existing.id },
    data: {
      jobTitle: input.jobTitle,
      companyName: input.companyName,
      jobUrl: input.jobUrl,
      source: input.source,
      location: input.location,
      workType: input.workType,
      status: transition.status,
      dateApplied: transition.dateApplied,
      deadline: input.deadline,
      followUpDate: input.followUpDate,
      lastStatusUpdateDate: transition.lastStatusUpdateDate,
      notes: input.notes,
    },
    include: { checklistItems: { orderBy: { position: "asc" } } },
  });
}

export async function deleteApplicationForUser(
  applicationId: string,
  userId: string,
) {
  const ownedApplicationId = await assertApplicationOwner(applicationId, userId);

  return prisma.application.delete({
    where: { id: ownedApplicationId },
    select: { id: true },
  });
}

export async function updateApplicationStatusForUser(
  applicationId: string,
  userId: string,
  input: StatusValidationInput,
): Promise<ApplicationWithChecklist> {
  const existing = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: {
      id: true,
      status: true,
      dateApplied: true,
      lastStatusUpdateDate: true,
    },
  });

  if (!existing) {
    throw new Error("Application not found.");
  }

  const transition = resolveStatusTransition({
    currentStatus: existing.status,
    nextStatus: input.status,
    currentDateApplied: existing.dateApplied,
    currentLastStatusUpdateDate: existing.lastStatusUpdateDate,
  });

  return prisma.application.update({
    where: { id: existing.id },
    data: {
      status: transition.status,
      dateApplied: transition.dateApplied,
      lastStatusUpdateDate: transition.lastStatusUpdateDate,
    },
    include: { checklistItems: { orderBy: { position: "asc" } } },
  });
}

export async function createChecklistItemForUser(
  applicationId: string,
  userId: string,
  input: ChecklistValidationInput,
) {
  const ownedApplicationId = await assertApplicationOwner(applicationId, userId);
  const position =
    input.position ??
    ((await prisma.checklistItem.aggregate({
      where: { applicationId: ownedApplicationId },
      _max: { position: true },
    }))._max.position ?? -1) + 1;

  return prisma.checklistItem.create({
    data: {
      applicationId: ownedApplicationId,
      title: input.title,
      isDone: input.isDone ?? false,
      position,
    },
  });
}

export async function updateChecklistItemForUser(
  checklistItemId: string,
  userId: string,
  input: ChecklistValidationInput,
) {
  const existing = await prisma.checklistItem.findFirst({
    where: {
      id: checklistItemId,
      application: { userId },
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Checklist item not found.");
  }

  return prisma.checklistItem.update({
    where: { id: existing.id },
    data: {
      title: input.title,
      isDone: input.isDone,
      position: input.position,
    },
  });
}

export async function deleteChecklistItemForUser(
  checklistItemId: string,
  userId: string,
) {
  const existing = await prisma.checklistItem.findFirst({
    where: {
      id: checklistItemId,
      application: { userId },
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Checklist item not found.");
  }

  return prisma.checklistItem.delete({
    where: { id: existing.id },
    select: { id: true },
  });
}
