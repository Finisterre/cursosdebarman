"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, FolderTree, Layers, ShoppingBag, Image, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/categories", label: "Categorías", icon: FolderTree },
  { href: "/admin/variant-types", label: "Variantes", icon: Layers },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/banners", label: "Banners", icon: Image },
] as const;

type AdminSidebarProps = {
  onNavigate?: () => void;
};

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-background">
      <div className="flex h-16 shrink-0 items-center border-b px-4">
        <Link href="/admin/dashboard" className="text-lg font-semibold">
          Admin fs-eshop
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={() => {
            document.cookie = "admin_session=; Max-Age=0; path=/";
            window.location.href = "/admin/login";
          }}
        >
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </aside>
  );
}
