/**
 * Rule-based WhatsApp message → transaction parser.
 *
 * No AI/LLM — Phase 1 is rule-based only. Pure functions, no
 * Next.js/Supabase imports, so they can be sanity-checked standalone.
 */

import { TX_CATEGORIES } from "../seed";

const AMOUNT_RE =
  /(\d+(?:[.,]\d+)?)\s*(juta|jt|ribu|rb|k)?/i;

const INCOME_KEYWORDS = ["gaji", "bonus", "terima", "dapat", "masuk", "freelance"];

const CATEGORY_RULES = {
  income: [
    { match: ["gaji"], key: "salary" },
    { match: ["freelance"], key: "freelance" },
    { match: ["bonus"], key: "bonus" },
    { match: ["invest", "saham", "reksadana"], key: "invest" },
  ],
  expense: [
    { match: ["makan", "nasi", "jajan", "sarapan", "lunch", "dinner"], key: "food" },
    { match: ["kopi", "minum", "teh", "jus", "boba", "susu"], key: "drink" },
    { match: ["rokok", "sigaret", "vape"], key: "cigarette" },
    { match: ["bensin", "ojek", "grab", "gojek", "parkir", "tol"], key: "transport" },
    { match: ["kursus", "buku", "belajar"], key: "learning" },
    { match: ["laptop", "device", "charger"], key: "device" },
    { match: ["nabung", "tabungan"], key: "saving" },
    { match: ["dana darurat", "darurat"], key: "emergency_fund" },
    { match: ["sedekah", "donasi", "zakat"], key: "charity" },
    { match: ["bpjs"], key: "bpjs" },
    { match: ["servis", "service", "motor"], key: "service" },
    { match: ["nonton", "game", "hiburan"], key: "fun" },
    { match: ["keluarga"], key: "family" },
    { match: ["transfer"], key: "other_out" },
  ],
};

const PAYMENT_METHODS = [
  "bca",
  "bri",
  "bni",
  "mandiri",
  "dana",
  "ovo",
  "gopay",
  "shopeepay",
  "cash",
  "tunai",
];

const FILLER_WORDS = ["beli", "bayar", "pake", "pakai", "via", "dari", "ke"];

function containsWord(text, word) {
  return new RegExp(`\\b${word}\\b`, "i").test(text);
}

/** Parses an amount, handling Indonesian shorthand (juta/jt, ribu/rb, k). Returns null if none found. */
export function parseAmount(text) {
  const match = text.match(AMOUNT_RE);
  if (!match) return null;
  const raw = match[1].replace(",", ".");
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return null;
  const unit = (match[2] || "").toLowerCase();
  if (unit === "juta" || unit === "jt") return Math.round(num * 1_000_000);
  if (unit === "ribu" || unit === "rb" || unit === "k") return Math.round(num * 1_000);
  return Math.round(num);
}

function inferType(text) {
  return INCOME_KEYWORDS.some((kw) => containsWord(text, kw)) ? "income" : "expense";
}

function inferCategory(text, type) {
  const rules = CATEGORY_RULES[type];
  for (const rule of rules) {
    if (rule.match.some((kw) => containsWord(text, kw))) return rule.key;
  }
  return type === "income" ? "other_in" : "daily";
}

function inferNotes(text) {
  const lower = text.toLowerCase();
  const methodMatch = lower.match(/\b(?:pake|pakai|via|dari)\s+([a-z][\w-]*)/i);
  if (methodMatch) return `via ${methodMatch[1].toUpperCase()}`;

  const keMatch = lower.match(/\bke\s+([a-z][\w-]*)/i);
  if (keMatch) return `ke ${keMatch[1].toUpperCase()}`;
  return "";
}

function inferTitle(text, category, type) {
  const amountMatch = text.match(AMOUNT_RE);
  let stripped = amountMatch ? text.replace(amountMatch[0], " ") : text;

  for (const method of PAYMENT_METHODS) {
    stripped = stripped.replace(new RegExp(`\\b${method}\\b`, "gi"), " ");
  }
  stripped = stripped.replace(/\bke\s+[\w-]+/gi, " ");
  for (const word of FILLER_WORDS) {
    stripped = stripped.replace(new RegExp(`\\b${word}\\b`, "gi"), " ");
  }

  const cleaned = stripped.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    const label = TX_CATEGORIES[type]?.find((c) => c.key === category)?.label;
    return label || (type === "income" ? "Pemasukan" : "Pengeluaran");
  }
  return cleaned
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Parses a raw WhatsApp message into transaction fields.
 * Returns { matched: false } if no amount could be found.
 */
export function parseMessage(rawText) {
  const text = (rawText || "").trim();
  const amount = parseAmount(text);
  if (amount === null) return { matched: false };

  const type = inferType(text);
  const category = inferCategory(text, type);
  const title = inferTitle(text, category, type);
  const notes = inferNotes(text);

  return {
    matched: true,
    type,
    category,
    amount,
    title,
    notes,
    date: new Date().toISOString().slice(0, 10),
    recurring: false,
  };
}
