/**
 * Number & date formatters used throughout the app.
 * Locale: id-ID for Rupiah.
 */

export const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatIDR(n) {
  if (n == null || Number.isNaN(n)) return "Rp 0";
  return IDR.format(n);
}

export function formatIDRShort(n) {
  if (n == null || Number.isNaN(n)) return "Rp 0";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1)} M`;
  if (abs >= 1_000_000) return `${sign}Rp ${(abs / 1_000_000).toFixed(1)} jt`;
  if (abs >= 1_000) return `${sign}Rp ${(abs / 1_000).toFixed(0)} rb`;
  return `${sign}Rp ${abs}`;
}

export function greetingForNow(name = "Rafli") {
  const h = new Date().getHours();
  if (h < 5) return `Larut ini, ${name}`;
  if (h < 11) return `Selamat pagi, ${name}`;
  if (h < 15) return `Selamat siang, ${name}`;
  if (h < 19) return `Selamat sore, ${name}`;
  return `Selamat malam, ${name}`;
}

export const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export const MONTHS_ID_LONG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatMonthYear(month, year) {
  if (month == null || year == null) return "";
  return `${MONTHS_ID[month - 1]} ${year}`;
}

export function formatDateID(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export function daysAgo(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / 86400000);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthKey(dateString) {
  return String(dateString).slice(0, 7);
}
