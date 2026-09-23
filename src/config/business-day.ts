/** The restaurant shift starts at 2 PM and closes at 3 AM the next day. */
export const BUSINESS_DAY_START_HOUR = 14;
export const BUSINESS_DAY_END_HOUR = 3;

export function businessDateInputValue(now = new Date()) {
  const businessDate = new Date(now);
  // Before today's shift begins, show the most recent shift's start date.
  if (businessDate.getHours() < BUSINESS_DAY_START_HOUR) {
    businessDate.setDate(businessDate.getDate() - 1);
  }
  const localDate = new Date(businessDate.getTime() - businessDate.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

export function businessDayRangeIso(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const start = new Date(year, month - 1, day, BUSINESS_DAY_START_HOUR, 0, 0, 0);
  const end = new Date(year, month - 1, day + 1, BUSINESS_DAY_END_HOUR, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}
