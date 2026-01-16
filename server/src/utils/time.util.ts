// time.util.ts
export function istToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0
): Date {
  // IST is UTC + 5:30
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30));
}
