const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateOnly(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string") {
    throw new Error("Date must use YYYY-MM-DD format.");
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const match = DATE_ONLY_PATTERN.exec(trimmed);

  if (!match) {
    throw new Error("Date must use YYYY-MM-DD format.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error("Date must be a valid calendar date.");
  }

  return parsed;
}
