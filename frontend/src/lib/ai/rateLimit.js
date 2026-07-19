/**
 * Shared daily request cap across every AI route (chat, action-plan,
 * financial-plan) — they all draw from the same free-tier OpenRouter
 * budget, so one counter total, not one per route. Server-only.
 */

const MAX_PER_DAY = Number(process.env.AI_MAX_REQUESTS_PER_DAY) || 200;
let requestCount = 0;
let countResetAt = startOfNextDay();

function startOfNextDay() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

export function withinDailyLimit() {
  if (Date.now() > countResetAt) {
    requestCount = 0;
    countResetAt = startOfNextDay();
  }
  if (requestCount >= MAX_PER_DAY) return false;
  requestCount += 1;
  return true;
}
