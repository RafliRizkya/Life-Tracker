/**
 * Prompt for the AI action-plan generator (Goals & Skills).
 * Plain module — safe to import from server routes only (kept alongside
 * promptBuilder.js's pattern, though this one is server-only since the
 * route is non-streaming).
 */

export const ACTION_PLAN_SYSTEM_PROMPT = `Kamu adalah asisten perencana di Rafli Life Tracker. Tugasmu: berdasarkan satu goal atau skill yang diberikan, susun 3-6 langkah konkret dan berurutan untuk mencapainya.

Aturan penting:
- Balas HANYA dengan JSON array valid, TANPA teks lain di luar JSON, format persis:
[{"title": "langkah singkat", "note": "detail atau tips singkat (opsional)"}]
- title maksimal 60 karakter, langsung actionable (mulai dengan kata kerja).
- note maksimal 120 karakter, opsional — boleh string kosong.
- Bahasa Indonesia, nada tenang dan praktis, bukan generik.
- Urutkan dari langkah paling awal/mudah ke yang lebih lanjut.`;

/**
 * @param {{title: string, area?: string, why?: string, kind?: string, context: "goal"|"skill"}} args
 */
export function buildActionPlanMessages({ title, area, why, kind, context }) {
  const label = context === "skill" ? "skill" : "goal";
  const parts = [`Buatkan action plan untuk ${label}: "${title}".`];
  if (area) parts.push(`Area: ${area}.`);
  if (kind) parts.push(`Jenis: ${kind === "quantitative" ? "kuantitatif (target angka)" : "kualitatif (pengembangan diri)"}.`);
  if (why) parts.push(`Alasan/konteks: ${why}.`);

  return [
    { role: "system", content: ACTION_PLAN_SYSTEM_PROMPT },
    { role: "user", content: parts.join(" ") },
  ];
}
