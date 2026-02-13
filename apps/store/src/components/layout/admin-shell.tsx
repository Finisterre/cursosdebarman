"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Mobile: overlay backdrop */}
      <button
        type="button"
        aria-label="Cerrar menú"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 md:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar: fixed left, hidden on mobile unless open */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 md:relative md:z-auto",
          sidebarOpen ? "block" : "hidden md:block"
        )}
      >
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main: top bar on mobile + content */}
      <div className="flex flex-1 flex-col min-w-0">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menú"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Admin</span>
        </div>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
