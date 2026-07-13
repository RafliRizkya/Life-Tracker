"use client";

import { Command } from "cmdk";
import { useLifeStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Wallet,
  Sparkles,
  BookOpen,
  Plus,
  Sun,
  Moon,
  DollarSign,
} from "lucide-react";

const PAGES = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, keywords: "beranda hari ini overview" },
  { href: "/goals", label: "Goals", icon: Target, keywords: "target impian" },
  { href: "/career", label: "Career", icon: TrendingUp, keywords: "karier journey milestone" },
  { href: "/finance", label: "Finance", icon: Wallet, keywords: "uang tabungan pengeluaran" },
  { href: "/skills", label: "Skills", icon: Sparkles, keywords: "belajar sql python data" },
  { href: "/review", label: "Weekly Review", icon: BookOpen, keywords: "refleksi mingguan" },
];

export default function CommandPalette() {
  const open = useLifeStore((s) => s.paletteOpen);
  const close = useLifeStore((s) => s.closePalette);
  const openQuickAdd = useLifeStore((s) => s.openQuickAdd);
  const setTheme = useLifeStore((s) => s.setTheme);
  const theme = useLifeStore((s) => s.settings.theme);
  const router = useRouter();

  // Close on route change externally
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start pt-[10vh] bg-ink/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-[min(560px,calc(100%-2rem))] mx-auto surface shadow-pop overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command palette" className="[&_[cmdk-input]]:outline-none">
          <div className="border-b border-line dark:border-night-border px-4">
            <Command.Input
              placeholder="Cari halaman atau kirim aksi cepat…"
              className="w-full py-3.5 text-sm bg-transparent placeholder:text-ink-muted"
              autoFocus
              data-testid="palette-input"
            />
          </div>
          <Command.List className="max-h-[420px] overflow-auto scrollbar-thin p-2">
            <Command.Empty className="px-4 py-6 text-sm text-ink-muted">
              Tidak ada hasil.
            </Command.Empty>

            <Command.Group heading="Navigasi" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1">
              {PAGES.map((p) => (
                <Command.Item
                  key={p.href}
                  value={`${p.label} ${p.keywords}`}
                  onSelect={() => {
                    router.push(p.href);
                    close();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-[13px] aria-selected:bg-forest-500/10 aria-selected:text-forest-500 dark:aria-selected:text-lime"
                >
                  <p.icon className="h-4 w-4" />
                  <span>Buka {p.label}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Quick add" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1">
              <PaletteAction icon={Plus} label="Tambah commitment" onSelect={() => { openQuickAdd("commitment"); close(); }} />
              <PaletteAction icon={Target} label="Tambah goal baru" onSelect={() => { openQuickAdd("goal"); close(); }} />
              <PaletteAction icon={DollarSign} label="Catat transaksi (pemasukan/keluar)" onSelect={() => { openQuickAdd("transaction"); close(); }} />
              <PaletteAction icon={TrendingUp} label="Tambah career milestone" onSelect={() => { openQuickAdd("milestone"); close(); }} />
              <PaletteAction icon={Sparkles} label="Tambah skill" onSelect={() => { openQuickAdd("skill"); close(); }} />
              <PaletteAction icon={BookOpen} label="Tambah reminder finance" onSelect={() => { openQuickAdd("reminder"); close(); }} />
            </Command.Group>

            <Command.Group heading="Preferensi" className="[&_[cmdk-group-heading]]:eyebrow [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1">
              <PaletteAction
                icon={theme === "dark" ? Sun : Moon}
                label={theme === "dark" ? "Beralih ke light mode" : "Beralih ke dark mode"}
                onSelect={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  close();
                }}
              />
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function PaletteAction({ icon: Icon, label, onSelect }) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer text-[13px] aria-selected:bg-forest-500/10 aria-selected:text-forest-500 dark:aria-selected:text-lime"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Command.Item>
  );
}
