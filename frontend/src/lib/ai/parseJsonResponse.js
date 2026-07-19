/**
 * Free-tier models don't reliably respect "JSON only" instructions — they
 * sometimes wrap it in prose or a markdown fence. Pulls out the first
 * balanced [...] or {...} and parses that, instead of trusting the whole
 * response to be clean JSON. Returns null on failure — callers turn that
 * into a "try again" error, never into a guess.
 */
export function extractJson(text) {
  const match = text.match(/[[{][\s\S]*[\]}]/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}
