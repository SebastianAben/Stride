import { ApplicationStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { parseDateOnly } from "./dates";
import { resolveStatusTransition } from "./status";
import { validateApplicationInput, validateStatusInput } from "./validation";

describe("application data helpers", () => {
  it("parses date-only strings as UTC calendar dates", () => {
    expect(parseDateOnly("2026-04-29")?.toISOString()).toBe(
      "2026-04-29T00:00:00.000Z",
    );
  });

  it("rejects invalid date-only strings", () => {
    expect(() => parseDateOnly("2026-02-30")).toThrow(
      "Date must be a valid calendar date.",
    );
    expect(() => parseDateOnly("04/29/2026")).toThrow(
      "Date must use YYYY-MM-DD format.",
    );
  });

  it("normalizes empty optional strings to null", () => {
    const parsed = validateApplicationInput({
      jobTitle: "Frontend Engineer",
      companyName: "Acme",
      jobUrl: "",
      source: " ",
      location: "",
      workType: "",
      notes: "",
    });

    expect(parsed).toEqual({
      success: true,
      data: expect.objectContaining({
        jobUrl: null,
        source: null,
        location: null,
        workType: null,
        notes: null,
      }),
    });
  });

  it("validates required application fields and job URL", () => {
    const parsed = validateApplicationInput({
      jobTitle: "",
      companyName: "",
      jobUrl: "ftp://example.test/job",
    });

    expect(parsed).toEqual({
      success: false,
      errors: expect.objectContaining({
        jobTitle: ["Job title is required."],
        companyName: ["Company name is required."],
        jobUrl: ["Enter a valid job URL."],
      }),
    });
  });

  it("updates status date only when status changes", () => {
    const lastStatusUpdateDate = new Date("2026-04-20T00:00:00.000Z");
    const now = new Date("2026-04-29T00:00:00.000Z");

    expect(
      resolveStatusTransition({
        currentStatus: ApplicationStatus.SAVED,
        nextStatus: ApplicationStatus.SAVED,
        currentLastStatusUpdateDate: lastStatusUpdateDate,
        now,
      }).lastStatusUpdateDate,
    ).toBe(lastStatusUpdateDate);

    expect(
      resolveStatusTransition({
        currentStatus: ApplicationStatus.SAVED,
        nextStatus: ApplicationStatus.INTERVIEW,
        currentLastStatusUpdateDate: lastStatusUpdateDate,
        now,
      }).lastStatusUpdateDate,
    ).toBe(now);
  });

  it("auto-fills dateApplied when moving from saved to an applied-stage status", () => {
    const now = new Date("2026-04-29T00:00:00.000Z");

    expect(
      resolveStatusTransition({
        currentStatus: ApplicationStatus.SAVED,
        nextStatus: ApplicationStatus.APPLIED,
        currentLastStatusUpdateDate: new Date("2026-04-20T00:00:00.000Z"),
        now,
      }).dateApplied,
    ).toBe(now);
  });

  it("validates status input", () => {
    expect(validateStatusInput({ status: ApplicationStatus.OFFER })).toEqual({
      success: true,
      data: { status: ApplicationStatus.OFFER },
    });
    expect(validateStatusInput({ status: "ARCHIVED" })).toEqual({
      success: false,
      errors: { status: ["Invalid application status."] },
    });
  });
});
