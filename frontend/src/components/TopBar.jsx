"use client";

import { useLifeStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import { Bell, Menu, Plus, Sun, Moon, Check, Loader2, AlertTriangle } from "lucide-react";
import { formatDateID } from "@/lib/format";
import clsx from "clsx";

const TITLES = {
  "/": "Dashboard",
  "/goals": "Goals",
  "/career": "Career",
  "/finance": "Finance",
  "/skills": "Skills",
  "/compass": "Life Compass",
};

export default function TopBar({ onMobileMenu }) {
  const pathname = usePathname();
  const label =
    TITLES[pathname] ||
    TITLES[Object.keys(TITLES).find((p) => p !== "/" && pathname.startsWith(p))] ||
    "Dashboard";

  const openQuickAdd = useLifeStore((s) => s.openQuickAdd);
  const toggleDrawer = useLifeStore((s) => s.toggleNotifDrawer);
  const notifications = useLifeStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const settings = useLifeStore((s) => s.settings);
  const setTheme = useLifeStore((s) => s.setTheme);
  const saveStatus = useLifeStore((s) => s.saveStatus);

  return (
    <header className="sticky top-0 z-20 border-b border-line dark:border-night-border bg-paper/85 dark:bg-night/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-16 px-5 md:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMobileMenu}
            data-testid="open-sidebar-btn"
            className="p-2 -ml-2 rounded-md lg:hidden hover:bg-line/50"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="eyebrow truncate">
              {label} · {formatDateID(new Date().toISOString().slice(0, 10))}
            </div>
            <div className="text-[10.5px] mt-0.5 flex items-center gap-1.5">
              <SaveIndicator status={saveStatus} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(settings.theme === "dark" ? "light" : "dark")}
            data-testid="theme-toggle"
            className="p-2 rounded-full hover:bg-line/50 dark:hover:bg-night-soft"
            aria-label="Toggle theme"
          >
            {settings.theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={toggleDrawer}
            data-testid="open-notifications"
            className="relative p-2 rounded-full hover:bg-line/50 dark:hover:bg-night-soft"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-terracotta" />
            )}
          </button>
          <button
            onClick={() => openQuickAdd("commitment")}
            data-testid="quick-add-btn"
            className="btn-dark"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah
          </button>
        </div>
      </div>
    </header>
  );
}

function SaveIndicator({ status }) {
  if (status === "saving")
    return (
      <span className="flex items-center gap-1 text-muted-foreground eyebrow text-ink-muted">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  if (status === "saved")
    return (
      <span className="flex items-center gap-1 eyebrow text-forest-500 dark:text-lime">
        <Check className="h-3 w-3" /> Saved
      </span>
    );
  if (status === "failed")
    return (
      <span className="flex items-center gap-1 eyebrow text-terracotta">
        <AlertTriangle className="h-3 w-3" /> Save failed
      </span>
    );
  return <span className="eyebrow text-ink-muted">Autosave aktif</span>;
}
