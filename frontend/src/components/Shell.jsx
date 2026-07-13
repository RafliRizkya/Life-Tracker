"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import CommandPalette from "./CommandPalette";
import QuickAddModal from "./QuickAddModal";
import NotificationsDrawer from "./NotificationsDrawer";
import { useLifeStore } from "@/lib/store";
import { useState } from "react";

export default function Shell({ children }) {
  const hydrated = useLifeStore((s) => s.hydrated);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="lg:grid lg:grid-cols-[268px_1fr] min-h-screen">
        <Sidebar mobileOpen={mobileSidebar} onClose={() => setMobileSidebar(false)} />
        <div className="min-w-0 flex flex-col">
          <TopBar onMobileMenu={() => setMobileSidebar(true)} />
          <main className="flex-1 min-w-0">
            {hydrated ? (
              children
            ) : (
              <div className="p-10 opacity-50 text-sm eyebrow">Menyalakan…</div>
            )}
          </main>
        </div>
      </div>
      <CommandPalette />
      <QuickAddModal />
      <NotificationsDrawer />
    </div>
  );
}
