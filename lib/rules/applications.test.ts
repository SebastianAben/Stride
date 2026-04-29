import { ApplicationStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  getBottleneckIndicator,
  getNextAction,
  getPriority,
  getProgressInsight,
  getTodayActions,
  type RuleApplication,
} from "./applications";

const today = new Date("2026-04-28T12:00:00.000Z");

function daysFromToday(days: number): Date {
  const date = new Date(today);

  date.setUTCDate(date.getUTCDate() + days);

  return date;
}

function application(
  overrides: Partial<RuleApplication> = {},
): RuleApplication {
  return {
    id: overrides.id ?? "application-1",
    status: overrides.status ?? ApplicationStatus.SAVED,
    dateSaved: overrides.dateSaved ?? daysFromToday(-1),
    dateApplied: overrides.dateApplied ?? null,
    deadline: overrides.deadline ?? null,
    followUpDate: overrides.followUpDate ?? null,
    lastStatusUpdateDate: overrides.lastStatusUpdateDate ?? daysFromToday(-1),
    checklistItems: overrides.checklistItems ?? [],
  };
}

describe("application SMART rules", () => {
  it("recommends applying before a near deadline and marks it high priority", () => {
    const savedApplication = application({
      deadline: daysFromToday(1),
    });

    expect(getNextAction(savedApplication, { today })).toBe(
      "Apply before deadline.",
    );
    expect(getPriority(savedApplication, { today }).level).toBe("High");
  });

  it("flags passed deadlines for saved jobs as high priority", () => {
    const savedApplication = application({
      deadline: daysFromToday(-1),
    });

    expect(getNextAction(savedApplication, { today })).toBe(
      "Deadline passed. Update status or archive this job.",
    );
    expect(getPriority(savedApplication, { today }).level).toBe("High");
  });

  it("puts applied jobs with follow-up due today into today's actions", () => {
    const appliedApplication = application({
      status: ApplicationStatus.APPLIED,
      dateApplied: daysFromToday(-7),
      followUpDate: today,
    });

    expect(getNextAction(appliedApplication, { today })).toBe("Send follow-up.");
    expect(getTodayActions([appliedApplication], { today })).toEqual([
      expect.objectContaining({
        application: appliedApplication,
        reasons: ["FOLLOW_UP_TODAY"],
      }),
    ]);
  });

  it("recommends updating stale applied jobs", () => {
    const appliedApplication = application({
      status: ApplicationStatus.APPLIED,
      dateApplied: daysFromToday(-14),
      lastStatusUpdateDate: daysFromToday(-14),
    });

    expect(getNextAction(appliedApplication, { today })).toBe(
      "Update status or mark as ghosted.",
    );
  });

  it("recommends interview preparation for interview jobs", () => {
    const interviewApplication = application({
      status: ApplicationStatus.INTERVIEW,
    });

    expect(getNextAction(interviewApplication, { today })).toBe(
      "Prepare interview notes/checklist.",
    );
  });

  it("excludes rejected jobs from today's actions and priority", () => {
    const rejectedApplication = application({
      status: ApplicationStatus.REJECTED,
      followUpDate: daysFromToday(-1),
    });

    expect(getTodayActions([rejectedApplication], { today })).toHaveLength(0);
    expect(getPriority(rejectedApplication, { today }).level).toBe("None");
  });

  it("detects saved-job bottlenecks", () => {
    const applications = Array.from({ length: 5 }, (_, index) =>
      application({ id: `saved-${index}` }),
    );

    expect(getBottleneckIndicator(applications, { today })).toEqual({
      type: "SAVED",
      message:
        "Many jobs are still saved. Consider applying to the most relevant ones.",
    });
  });

  it("detects applied-job bottlenecks", () => {
    const applications = Array.from({ length: 5 }, (_, index) =>
      application({
        id: `applied-${index}`,
        status: ApplicationStatus.APPLIED,
        dateApplied: daysFromToday(-2),
      }),
    );

    expect(getBottleneckIndicator(applications, { today })).toEqual({
      type: "APPLIED",
      message:
        "Many applications are waiting for response. Review follow-up dates and application quality.",
    });
  });

  it("detects follow-up bottlenecks", () => {
    const applications = Array.from({ length: 3 }, (_, index) =>
      application({
        id: `follow-up-${index}`,
        status: ApplicationStatus.APPLIED,
        dateApplied: daysFromToday(-2),
        followUpDate: daysFromToday(-1),
      }),
    );

    expect(getBottleneckIndicator(applications, { today })).toEqual({
      type: "FOLLOW_UP",
      message: "Several applications need follow-up. Clear these first.",
    });
  });

  it("calculates progress insight without division errors", () => {
    expect(getProgressInsight([], { today })).toMatchObject({
      totalSavedJobs: 0,
      totalAppliedJobs: 0,
      responseRate: 0,
      interviewRate: 0,
    });
  });
});
