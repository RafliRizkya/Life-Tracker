/**
 * Server-only WhatsApp webhook security helpers.
 * Never import from a "use client" file.
 */

import { createHmac, timingSafeEqual } from "crypto";

/** Verifies Meta's X-Hub-Signature-256 header against the raw request body. */
export function verifySignature(rawBody, signatureHeader, appSecret) {
  if (!signatureHeader || !appSecret) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const provided = signatureHeader.replace(/^sha256=/, "");

  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

/** Normalizes and compares a WhatsApp sender id against the single allowed number. */
export function isAllowedSender(fromNumber) {
  const allowed = process.env.WHATSAPP_ALLOWED_NUMBER;
  if (!allowed) return false;
  const normalize = (n) => (n || "").replace(/\D/g, "");
  return normalize(fromNumber) === normalize(allowed);
}
