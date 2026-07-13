"use client";

import { useLifeStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCheck, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale/id";
import clsx from "clsx";

const TONE_STYLES = {
  info: "border-forest-300 dark:border-forest-500/40",
  warning: "border-terracotta/50",
  success: "border-lime-deep/60",
};

export default function NotificationsDrawer() {
  const open = useLifeStore((s) => s.notifDrawerOpen);
  const toggle = useLifeStore((s) => s.toggleNotifDrawer);
  const list = useLifeStore((s) => s.notifications);
  const markRead = useLifeStore((s) => s.markNotificationRead);
  const clearAll = useLifeStore((s) => s.clearNotifications);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-ink/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={toggle}
        >
          <motion.aside
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", damping: 24, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-paper dark:bg-night border-l border-line dark:border-night-border overflow-y-auto"
          >
            <div className="sticky top-0 flex items-center justify-between p-5 border-b border-line dark:border-night-border bg-paper/95 dark:bg-night/95 backdrop-blur">
              <div>
                <div className="eyebrow">Notifikasi</div>
                <div className="h-display text-[20px] mt-0.5">Yang perlu perhatianmu</div>
              </div>
              <button
                onClick={toggle}
                className="p-1.5 rounded-md hover:bg-line/50"
                aria-label="Close"
                data-testid="close-notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-2.5">
              {list.length === 0 && (
                <div className="text-center py-12 text-ink-muted">
                  <Bell className="mx-auto h-5 w-5 opacity-40" />
                  <div className="mt-3 text-sm">Tidak ada notifikasi.</div>
                </div>
              )}
              {list.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={clsx(
                    "block w-full text-left rounded-xl p-4 border transition-all",
                    n.read
                      ? "opacity-70 bg-transparent border-line dark:border-night-border"
                      : "bg-card dark:bg-night-card shadow-card " + (TONE_STYLES[n.tone] || TONE_STYLES.info)
                  )}
                >
                  <div className="text-[13px] font-semibold">{n.title}</div>
                  <div className="text-[12px] text-ink-muted mt-1">{n.body}</div>
                  <div className="mt-2 eyebrow">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: idLocale })}
                  </div>
                </button>
              ))}
              {list.length > 0 && (
                <button
                  onClick={clearAll}
                  className="mt-4 w-full flex items-center justify-center gap-2 text-[12px] text-ink-muted hover:text-ink py-2.5 rounded-lg border border-dashed border-line dark:border-night-border"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Tandai semua telah dibaca
                </button>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
