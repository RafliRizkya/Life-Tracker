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

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
