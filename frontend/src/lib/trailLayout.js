/**
 * Pure layout math for the Career "Trail" visualization. No React/DOM —
 * safe to call from server or client, and easy to reason about in isolation.
 */

/** Maps a milestone's contribution (0-30) to a connector-dot diameter in px. */
export function contributionToSize(contribution, { base, range }) {
  const pct = Math.max(0, Math.min(30, contribution || 0)) / 30;
  return base + pct * range;
}
