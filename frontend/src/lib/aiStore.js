/**
 * Standalone Zustand store for the AI chat thread. Deliberately separate
 * from useLifeStore (lib/store.js) — a chat transcript has a different
 * lifecycle than the 7 tracked life modules and shouldn't ride along any
 * future full-state Supabase sync of that store.
 */

"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

const STORAGE_KEY = "rafli-life-tracker::ai-thread::v1";

function loadFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: state.messages }));
  } catch {
    /* quota exceeded — ignore */
  }
}

export const useAiStore = create((set, get) => ({
  messages: [],
  streaming: false,
  hydrated: false,

  hydrate: () => {
    const stored = loadFromStorage();
    set({ messages: stored?.messages || [], hydrated: true });
  },

  addMessage: (role, content, manifest) => {
    const msg = { id: nanoid(10), role, content, manifest, createdAt: new Date().toISOString() };
    set({ messages: [...get().messages, msg] });
    saveToStorage(get());
    return msg;
  },

  appendToLastMessage: (chunk) => {
    set({
      messages: get().messages.map((m, i, arr) =>
        i === arr.length - 1 ? { ...m, content: m.content + chunk } : m
      ),
    });
  },

  finalizeLastMessage: () => {
    saveToStorage(get());
  },

  setStreaming: (streaming) => set({ streaming }),

  clearThread: () => {
    set({ messages: [] });
    saveToStorage(get());
  },
}));
