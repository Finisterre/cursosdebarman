import Link from "next/link";
import { cn } from "@/lib/utils";

export type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

type AdminBreadcrumbProps = {
  items: AdminBreadcrumbItem[];
  className?: string;
};

export function AdminBreadcrumb({ items, className }: AdminBreadcrumbProps) {
  const allItems = [{ label: "Admin", href: "/admin/dashboard" }, ...items];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
        className
      )}
    >
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const isCurrent = isLast || !item.href;
        return (
          <span key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="select-none text-muted-foreground/70" aria-hidden>
                /
              </span>
            )}
            {isCurrent ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href as any}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
