"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Wallet,
  Sparkles,
  BookOpen,
  Command,
  X,
} from "lucide-react";
import { useLifeStore } from "@/lib/store";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/career", label: "Career", icon: TrendingUp },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/skills", label: "Skills", icon: Sparkles },
  { href: "/review", label: "Weekly Review", icon: BookOpen },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const pathname = usePathname();
  const openPalette = useLifeStore((s) => s.openPalette);
  const user = useLifeStore((s) => s.user);

  return (
    <>
      {/* mobile backdrop */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm lg:hidden transition-opacity",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-[268px] px-5 pt-6 pb-6",
          "flex flex-col text-[13.5px]",
          "bg-forest-700 text-forest-50",
          "dark:bg-night dark:text-night-text",
          "border-r border-forest-800 dark:border-night-border",
          "transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen"
        )}
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-lime text-forest-700 font-display font-bold">
              R
            </span>
            <span className="font-semibold tracking-tight">
              rafli<span className="text-lime">.</span>life
            </span>
          </Link>
          <button
            data-testid="close-sidebar-btn"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-forest-600 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* profile mini */}
        <div className="mt-9 mb-6 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-terracotta text-forest-800 font-display font-bold">
            {user?.fullName?.[0] ?? "R"}
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-[13px]">{user?.fullName}</div>
            <div className="text-[10.5px] text-forest-100/70">
              Building the next chapter
            </div>
          </div>
        </div>

        {/* nav */}
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={clsx(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  active
                    ? "bg-forest-500 text-white"
                    : "text-forest-100/80 hover:text-white hover:bg-forest-600/70"
                )}
              >
                <Icon
                  className={clsx(
                    "h-4 w-4",
                    active ? "text-lime" : "text-forest-100/60 group-hover:text-lime"
                  )}
                />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* palette trigger */}
        <button
          onClick={() => {
            openPalette();
            onClose?.();
          }}
          data-testid="palette-trigger"
          className="mt-auto flex items-center gap-2 w-full rounded-lg border border-forest-600 dark:border-night-border px-3 py-2.5 text-[11.5px] text-forest-100/80 hover:text-white hover:border-forest-500 transition-colors"
        >
          <Command className="h-3.5 w-3.5" />
          <span>Search anything</span>
          <span className="ml-auto text-[10px] rounded bg-forest-600/60 px-1.5 py-0.5">
            ⌘K
          </span>
        </button>
      </aside>
    </>
  );
}
