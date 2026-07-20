"use client";

import { useEffect } from "react";
import { useLifeStore } from "@/lib/store";

/**
 * Client-only provider that:
 *  - Hydrates the Zustand store from localStorage on first mount.
 *  - Applies theme + reduced motion + Ctrl/Cmd+K global shortcut.
 */
export default function Providers({ children }) {
  const hydrate = useLifeStore((s) => s.hydrate);
  const hydrated = useLifeStore((s) => s.hydrated);
  const settings = useLifeStore((s) => s.settings);
  const openPalette = useLifeStore((s) => s.openPalette);
  const syncWhatsAppTransactions = useLifeStore((s) => s.syncWhatsAppTransactions);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Retries a previously-failed Supabase push as soon as the browser
  // reconnects — don't wait for the user to happen to make another edit.
  useEffect(() => {
    function onOnline() {
      useLifeStore.getState().retryPendingSync();
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  useEffect(() => {
    if (hydrated) syncWhatsAppTransactions();
  }, [hydrated, syncWhatsAppTransactions]);

  // Theme
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [hydrated, settings.theme]);

  // Ctrl/Cmd+K shortcut
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette]);

  return children;
}
