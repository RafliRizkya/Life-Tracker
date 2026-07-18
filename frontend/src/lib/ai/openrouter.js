/**
 * OpenRouter client — server-only. Never import from a "use client" file.
 * Free-tier models only, by design — no request here may ever hit a paid model.
 */

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

const FALLBACK_CHAIN = [
  process.env.MODEL_TENCENT || "tencent/hy3:free",
  process.env.MODEL_NVIDIA || "nvidia/nemotron-3-ultra-550b-a55b:free",
  process.env.MODEL_POOLSIDE || "poolside/laguna-m.1:free",
  process.env.MODEL_OPENAI || "openai/gpt-oss-20b:free",
  process.env.MODEL_GOOGLE || "google/gemma-4-31b-it:free",
].filter(Boolean);

const CACHED_MODEL_TTL_MS = 10 * 60 * 1000;
const FREE_MODEL_DISCOVERY_TTL_MS = 5 * 60 * 1000;
const TIMEOUT_TO_FIRST_BYTE_MS = 8000;

let cachedGoodModel = null; // { id, expiresAt }
let cachedFreeDiscovery = null; // { id, expiresAt }

function apiKey() {
  return process.env.OPENROUTER_KEY;
}

async function discoverFreeModel() {
  if (cachedFreeDiscovery && cachedFreeDiscovery.expiresAt > Date.now()) {
    return cachedFreeDiscovery.id;
  }
  const res = await fetch(`${OPENROUTER_BASE_URL}/models`);
  if (!res.ok) throw new Error(`models list failed: ${res.status}`);
  const data = await res.json();
  const free = (data.data || []).find(
    (m) => m.pricing?.prompt === "0" && m.pricing?.completion === "0"
  );
  if (!free) throw new Error("no free model found in catalog");
  cachedFreeDiscovery = { id: free.id, expiresAt: Date.now() + FREE_MODEL_DISCOVERY_TTL_MS };
  return free.id;
}

async function tryModel(modelId, messages) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_TO_FIRST_BYTE_MS);
  try {
    const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: modelId, messages, stream: true }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok || !res.body) return null;
    return res;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

function candidateOrder() {
  const list = [];
  if (cachedGoodModel && cachedGoodModel.expiresAt > Date.now()) {
    list.push(cachedGoodModel.id);
  }
  for (const m of FALLBACK_CHAIN) {
    if (!list.includes(m)) list.push(m);
  }
  return list;
}

function remember(modelId) {
  cachedGoodModel = { id: modelId, expiresAt: Date.now() + CACHED_MODEL_TTL_MS };
}

/**
 * Streams a chat completion, trying the fallback chain in order, then a
 * dynamically-discovered free model, then one more retry pass through the
 * chain. Returns { stream, modelId } on success. Throws once every rung
 * (including the retry pass) has failed — caller returns 503, no bytes sent.
 */
export async function streamChatCompletion({ messages }) {
  for (const modelId of candidateOrder()) {
    const res = await tryModel(modelId, messages);
    if (res) {
      remember(modelId);
      return { stream: res.body, modelId };
    }
  }

  try {
    const freeId = await discoverFreeModel();
    const res = await tryModel(freeId, messages);
    if (res) {
      remember(freeId);
      return { stream: res.body, modelId: freeId };
    }
  } catch {
    /* fall through to final retry pass */
  }

  // "cache & retry" — one more pass through the chain
  for (const modelId of FALLBACK_CHAIN) {
    const res = await tryModel(modelId, messages);
    if (res) {
      remember(modelId);
      return { stream: res.body, modelId };
    }
  }

  throw new Error("all_models_failed");
}
