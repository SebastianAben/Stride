import { ApplicationStatus } from "@prisma/client";

export type ApplicationStatusValue =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export type RuleChecklistItem = {
  isDone: boolean;
};

export type RuleApplication = {
  id: string;
  status: ApplicationStatusValue;
  dateSaved: Date;
  dateApplied?: Date | null;
  deadline?: Date | null;
  followUpDate?: Date | null;
  lastStatusUpdateDate: Date;
  checklistItems?: RuleChecklistItem[];
};

export type RuleOptions = {
  today?: Date;
  deadlineSoonDays?: number;
  savedStaleDays?: number;
  appliedStaleDays?: number;
  onlineTestStaleDays?: number;
  interviewStaleDays?: number;
};

export type PriorityLevel = "High" | "Medium" | "Low" | "None";

export type Priority = {
  score: number;
  level: PriorityLevel;
};

export type TodayActionReason =
  | "FOLLOW_UP_OVERDUE"
  | "FOLLOW_UP_TODAY"
  | "DEADLINE_TODAY"
  | "DEADLINE_SOON"
  | "APPLIED_STALE"
  | "ONLINE_TEST_STALE"
  | "INTERVIEW_STALE"
  | "CHECKLIST_PENDING";

export type TodayAction<TApplication extends RuleApplication = RuleApplication> = {
  application: TApplication;
  nextAction: string;
  priority: Priority;
  reasons: TodayActionReason[];
};

export type ProgressInsight = {
  totalSavedJobs: number;
  totalAppliedJobs: number;
  waitingResponse: number;
  followUpDue: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  ghostedCount: number;
  activeApplications: number;
  responseRate: number;
  interviewRate: number;
};

export type BottleneckIndicator = {
  type:
    | "SAVED"
    | "APPLIED"
    | "INTERVIEW"
    | "FOLLOW_UP"
    | "DEADLINE"
    | "NONE";
  message: string;
};

type ResolvedRuleOptions = Required<Omit<RuleOptions, "today">> & {
  today: Date;
};

const DEFAULT_OPTIONS: ResolvedRuleOptions = {
  today: new Date(),
  deadlineSoonDays: 3,
  savedStaleDays: 7,
  appliedStaleDays: 14,
  onlineTestStaleDays: 7,
  interviewStaleDays: 10,
};

const ACTIVE_STATUSES = new Set<ApplicationStatusValue>([
  ApplicationStatus.SAVED,
  ApplicationStatus.APPLIED,
  ApplicationStatus.ONLINE_TEST,
  ApplicationStatus.INTERVIEW,
]);

const APPLIED_STAGE_STATUSES = new Set<ApplicationStatusValue>([
  ApplicationStatus.APPLIED,
  ApplicationStatus.ONLINE_TEST,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
  ApplicationStatus.GHOSTED,
]);

const RESPONSE_STATUSES = new Set<ApplicationStatusValue>([
  ApplicationStatus.ONLINE_TEST,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
  ApplicationStatus.GHOSTED,
]);

const TERMINAL_STATUSES = new Set<ApplicationStatusValue>([
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
  ApplicationStatus.GHOSTED,
]);

export function getNextAction(
  application: RuleApplication,
  options: RuleOptions = {},
): string {
  const resolvedOptions = resolveOptions(options);
  const derived = getDerivedDates(application, resolvedOptions);

  if (
    application.status === ApplicationStatus.SAVED &&
    derived.daysUntilDeadline !== null &&
    derived.daysUntilDeadline < 0
  ) {
    return "Deadline passed. Update status or archive this job.";
  }

  if (
    application.status === ApplicationStatus.SAVED &&
    derived.daysUntilDeadline !== null &&
    derived.daysUntilDeadline <= resolvedOptions.deadlineSoonDays
  ) {
    return "Apply before deadline.";
  }

  if (application.status === ApplicationStatus.SAVED && !application.deadline) {
    return "Review and decide whether to apply.";
  }

  if (
    application.status === ApplicationStatus.SAVED &&
    derived.daysSinceLastStatusUpdate >= resolvedOptions.savedStaleDays
  ) {
    return "Apply soon or remove from priority list.";
  }

  if (
    application.status === ApplicationStatus.APPLIED &&
    derived.isFollowUpDue
  ) {
    return "Send follow-up.";
  }

  if (
    application.status === ApplicationStatus.APPLIED &&
    derived.daysSinceLastStatusUpdate >= resolvedOptions.appliedStaleDays
  ) {
    return "Update status or mark as ghosted.";
  }

  if (
    application.status === ApplicationStatus.ONLINE_TEST &&
    derived.daysSinceLastStatusUpdate >= resolvedOptions.onlineTestStaleDays
  ) {
    return "Check online test result or update status.";
  }

  if (application.status === ApplicationStatus.ONLINE_TEST) {
    return "Complete or review online test progress.";
  }

  if (
    application.status === ApplicationStatus.INTERVIEW &&
    derived.isFollowUpDue
  ) {
    return "Follow up after interview.";
  }

  if (
    application.status === ApplicationStatus.INTERVIEW &&
    derived.daysSinceLastStatusUpdate >= resolvedOptions.interviewStaleDays
  ) {
    return "Update interview result or follow up.";
  }

  if (application.status === ApplicationStatus.INTERVIEW) {
    return "Prepare interview notes/checklist.";
  }

  if (application.status === ApplicationStatus.OFFER) {
    return "Review offer and next steps.";
  }

  if (application.status === ApplicationStatus.REJECTED) {
    return "Record notes and learnings.";
  }

  if (application.status === ApplicationStatus.GHOSTED) {
    return "Archive or revisit later.";
  }

  return "Review application status.";
}

export function getPriority(
  application: RuleApplication,
  options: RuleOptions = {},
): Priority {
  const resolvedOptions = resolveOptions(options);
  const derived = getDerivedDates(application, resolvedOptions);
  let score = 0;

  if (
    application.status === ApplicationStatus.SAVED &&
    derived.daysUntilDeadline !== null
  ) {
    if (derived.daysUntilDeadline < 0) {
      score += 100;
    } else if (derived.daysUntilDeadline === 0) {
      score += 90;
    } else if (derived.daysUntilDeadline <= 1) {
      score += 80;
    } else if (derived.daysUntilDeadline <= resolvedOptions.deadlineSoonDays) {
      score += 60;
    }
  }

  if (isActiveStatus(application.status) && application.followUpDate) {
    if (derived.daysUntilFollowUp !== null && derived.daysUntilFollowUp < 0) {
      score += 70;
    } else if (derived.daysUntilFollowUp === 0) {
      score += 60;
    }
  }

  if (application.status === ApplicationStatus.INTERVIEW) {
    score += 35;
  } else if (application.status === ApplicationStatus.ONLINE_TEST) {
    score += 30;
  } else if (application.status === ApplicationStatus.APPLIED) {
    score += 25;
  } else if (application.status === ApplicationStatus.SAVED) {
    score += 10;
  }

  if (isStale(application, resolvedOptions)) {
    score += 25;
  }

  if (isActiveStatus(application.status) && hasPendingChecklist(application)) {
    score += 10;
  }

  if (application.status === ApplicationStatus.REJECTED) {
    score -= 100;
  } else if (application.status === ApplicationStatus.GHOSTED) {
    score -= 80;
  } else if (application.status === ApplicationStatus.OFFER) {
    score -= 30;
  }

  return {
    score,
    level: getPriorityLevel(score),
  };
}

export function getPriorityQueue<TApplication extends RuleApplication>(
  applications: TApplication[],
  options: RuleOptions = {},
): Array<TApplication & { priority: Priority; nextAction: string }> {
  const resolvedOptions = resolveOptions(options);

  return applications
    .map((application) => ({
      ...application,
      priority: getPriority(application, resolvedOptions),
      nextAction: getNextAction(application, resolvedOptions),
    }))
    .sort((left, right) => comparePriorityQueue(left, right));
}

export function getTodayActions<TApplication extends RuleApplication>(
  applications: TApplication[],
  options: RuleOptions = {},
): Array<TodayAction<TApplication>> {
  const resolvedOptions = resolveOptions(options);

  return applications
    .map((application) => ({
      application,
      nextAction: getNextAction(application, resolvedOptions),
      priority: getPriority(application, resolvedOptions),
      reasons: getTodayActionReasons(application, resolvedOptions),
    }))
    .filter((action) => action.reasons.length > 0)
    .sort((left, right) => {
      const reasonRank =
        getHighestReasonRank(left.reasons) - getHighestReasonRank(right.reasons);

      if (reasonRank !== 0) {
        return reasonRank;
      }

      return comparePriorityQueue(
        { ...left.application, priority: left.priority },
        { ...right.application, priority: right.priority },
      );
    });
}

export function getProgressInsight(
  applications: RuleApplication[],
  options: RuleOptions = {},
): ProgressInsight {
  const resolvedOptions = resolveOptions(options);
  const totalAppliedJobs = applications.filter((application) =>
    APPLIED_STAGE_STATUSES.has(application.status),
  ).length;
  const responseCount = applications.filter((application) =>
    RESPONSE_STATUSES.has(application.status),
  ).length;
  const interviewCount = countStatus(applications, ApplicationStatus.INTERVIEW);

  return {
    totalSavedJobs: applications.length,
    totalAppliedJobs,
    waitingResponse: countStatus(applications, ApplicationStatus.APPLIED),
    followUpDue: applications.filter((application) => {
      const derived = getDerivedDates(application, resolvedOptions);

      return isActiveStatus(application.status) && derived.isFollowUpDue;
    }).length,
    interviewCount,
    offerCount: countStatus(applications, ApplicationStatus.OFFER),
    rejectedCount: countStatus(applications, ApplicationStatus.REJECTED),
    ghostedCount: countStatus(applications, ApplicationStatus.GHOSTED),
    activeApplications: applications.filter((application) =>
      isActiveStatus(application.status),
    ).length,
    responseRate:
      totalAppliedJobs === 0 ? 0 : responseCount / totalAppliedJobs,
    interviewRate:
      totalAppliedJobs === 0 ? 0 : interviewCount / totalAppliedJobs,
  };
}

export function getBottleneckIndicator(
  applications: RuleApplication[],
  options: RuleOptions = {},
): BottleneckIndicator {
  const insight = getProgressInsight(applications, options);
  const activeTotal = insight.activeApplications;
  const savedCount = countStatus(applications, ApplicationStatus.SAVED);
  const appliedCount = countStatus(applications, ApplicationStatus.APPLIED);
  const deadlineSoonCount = applications.filter((application) => {
    const derived = getDerivedDates(application, resolveOptions(options));

    return (
      application.status === ApplicationStatus.SAVED &&
      derived.daysUntilDeadline !== null &&
      derived.daysUntilDeadline >= 0 &&
      derived.daysUntilDeadline <= resolveOptions(options).deadlineSoonDays
    );
  }).length;

  if (activeTotal >= 5 && savedCount / activeTotal >= 0.5) {
    return {
      type: "SAVED",
      message:
        "Many jobs are still saved. Consider applying to the most relevant ones.",
    };
  }

  if (activeTotal >= 5 && appliedCount / activeTotal >= 0.5) {
    return {
      type: "APPLIED",
      message:
        "Many applications are waiting for response. Review follow-up dates and application quality.",
    };
  }

  if (activeTotal >= 3 && insight.interviewCount / activeTotal >= 0.4) {
    return {
      type: "INTERVIEW",
      message:
        "Several applications are in interview stage. Prioritize interview preparation.",
    };
  }

  if (insight.followUpDue >= 3) {
    return {
      type: "FOLLOW_UP",
      message: "Several applications need follow-up. Clear these first.",
    };
  }

  if (deadlineSoonCount >= 3) {
    return {
      type: "DEADLINE",
      message:
        "Several saved jobs have upcoming deadlines. Prioritize applying.",
    };
  }

  return {
    type: "NONE",
    message: "No major bottleneck detected. Keep applications updated.",
  };
}

function resolveOptions(options: RuleOptions): ResolvedRuleOptions {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
    today: options.today ?? DEFAULT_OPTIONS.today,
  };
}

function getDerivedDates(
  application: RuleApplication,
  options: ResolvedRuleOptions,
) {
  const daysUntilDeadline = application.deadline
    ? differenceInCalendarDays(application.deadline, options.today)
    : null;
  const daysUntilFollowUp = application.followUpDate
    ? differenceInCalendarDays(application.followUpDate, options.today)
    : null;

  return {
    daysUntilDeadline,
    daysUntilFollowUp,
    daysSinceSaved: differenceInCalendarDays(options.today, application.dateSaved),
    daysSinceApplied: application.dateApplied
      ? differenceInCalendarDays(options.today, application.dateApplied)
      : null,
    daysSinceLastStatusUpdate: differenceInCalendarDays(
      options.today,
      application.lastStatusUpdateDate,
    ),
    isFollowUpDue: daysUntilFollowUp !== null && daysUntilFollowUp <= 0,
    isDeadlineSoon:
      daysUntilDeadline !== null &&
      daysUntilDeadline >= 0 &&
      daysUntilDeadline <= options.deadlineSoonDays,
    isOverdue: daysUntilDeadline !== null && daysUntilDeadline < 0,
  };
}

function getTodayActionReasons(
  application: RuleApplication,
  options: ResolvedRuleOptions,
): TodayActionReason[] {
  const derived = getDerivedDates(application, options);
  const reasons: TodayActionReason[] = [];

  if (!TERMINAL_STATUSES.has(application.status) && application.followUpDate) {
    if (derived.daysUntilFollowUp !== null && derived.daysUntilFollowUp < 0) {
      reasons.push("FOLLOW_UP_OVERDUE");
    } else if (derived.daysUntilFollowUp === 0) {
      reasons.push("FOLLOW_UP_TODAY");
    }
  }

  if (
    application.status === ApplicationStatus.SAVED &&
    derived.daysUntilDeadline !== null
  ) {
    if (derived.daysUntilDeadline === 0) {
      reasons.push("DEADLINE_TODAY");
    } else if (
      derived.daysUntilDeadline > 0 &&
      derived.daysUntilDeadline <= options.deadlineSoonDays
    ) {
      reasons.push("DEADLINE_SOON");
    }
  }

  if (
    application.status === ApplicationStatus.APPLIED &&
    derived.daysSinceLastStatusUpdate >= options.appliedStaleDays
  ) {
    reasons.push("APPLIED_STALE");
  }

  if (
    application.status === ApplicationStatus.ONLINE_TEST &&
    derived.daysSinceLastStatusUpdate >= options.onlineTestStaleDays
  ) {
    reasons.push("ONLINE_TEST_STALE");
  }

  if (
    application.status === ApplicationStatus.INTERVIEW &&
    derived.daysSinceLastStatusUpdate >= options.interviewStaleDays
  ) {
    reasons.push("INTERVIEW_STALE");
  }

  if (isActiveStatus(application.status) && hasPendingChecklist(application)) {
    reasons.push("CHECKLIST_PENDING");
  }

  return reasons;
}

function getHighestReasonRank(reasons: TodayActionReason[]): number {
  const ranks: Record<TodayActionReason, number> = {
    FOLLOW_UP_OVERDUE: 1,
    FOLLOW_UP_TODAY: 1,
    DEADLINE_TODAY: 2,
    DEADLINE_SOON: 3,
    APPLIED_STALE: 4,
    ONLINE_TEST_STALE: 5,
    INTERVIEW_STALE: 6,
    CHECKLIST_PENDING: 7,
  };

  return Math.min(...reasons.map((reason) => ranks[reason]));
}

function comparePriorityQueue(
  left: RuleApplication & { priority: Priority },
  right: RuleApplication & { priority: Priority },
): number {
  const scoreDiff = right.priority.score - left.priority.score;

  if (scoreDiff !== 0) {
    return scoreDiff;
  }

  return (
    compareNullableDates(left.deadline, right.deadline) ||
    compareNullableDates(left.followUpDate, right.followUpDate) ||
    compareDates(left.lastStatusUpdateDate, right.lastStatusUpdateDate) ||
    compareDates(right.dateSaved, left.dateSaved)
  );
}

function compareNullableDates(
  left?: Date | null,
  right?: Date | null,
): number {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return compareDates(left, right);
}

function compareDates(left: Date, right: Date): number {
  return left.getTime() - right.getTime();
}

function getPriorityLevel(score: number): PriorityLevel {
  if (score >= 80) {
    return "High";
  }

  if (score >= 40) {
    return "Medium";
  }

  if (score > 0) {
    return "Low";
  }

  return "None";
}

function isStale(
  application: RuleApplication,
  options: ResolvedRuleOptions,
): boolean {
  const daysSinceLastStatusUpdate = differenceInCalendarDays(
    options.today,
    application.lastStatusUpdateDate,
  );

  if (application.status === ApplicationStatus.SAVED) {
    return daysSinceLastStatusUpdate >= options.savedStaleDays;
  }

  if (application.status === ApplicationStatus.APPLIED) {
    return daysSinceLastStatusUpdate >= options.appliedStaleDays;
  }

  if (application.status === ApplicationStatus.ONLINE_TEST) {
    return daysSinceLastStatusUpdate >= options.onlineTestStaleDays;
  }

  if (application.status === ApplicationStatus.INTERVIEW) {
    return daysSinceLastStatusUpdate >= options.interviewStaleDays;
  }

  return false;
}

function hasPendingChecklist(application: RuleApplication): boolean {
  return application.checklistItems?.some((item) => !item.isDone) ?? false;
}

function isActiveStatus(status: ApplicationStatusValue): boolean {
  return ACTIVE_STATUSES.has(status);
}

function countStatus(
  applications: RuleApplication[],
  status: ApplicationStatusValue,
): number {
  return applications.filter((application) => application.status === status)
    .length;
}

function differenceInCalendarDays(left: Date, right: Date): number {
  const leftStart = Date.UTC(
    left.getFullYear(),
    left.getMonth(),
    left.getDate(),
  );
  const rightStart = Date.UTC(
    right.getFullYear(),
    right.getMonth(),
    right.getDate(),
  );

  return Math.round((leftStart - rightStart) / 86_400_000);
}
