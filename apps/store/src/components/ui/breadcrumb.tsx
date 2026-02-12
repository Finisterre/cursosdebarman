"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export type BreadcrumbProps = {
  /** Raíz del breadcrumb. Por defecto: { label: "Inicio", href: "/" } */
  root?: BreadcrumbItem;
  /** Primera posición después de la raíz (ej. "Productos" → "/products"). Si no se pasa, se infiere del path. */
  firstSegment?: BreadcrumbItem;
  /** Segmentos extra con etiqueta personalizada. Clave = segmento en la URL (ej. "electronics"). */
  segmentLabels?: Record<string, string>;
  /** Si es true, no genera segmentos dinámicos desde la URL; solo muestra root + firstSegment. */
  staticOnly?: boolean;
  className?: string;
  /** Separador entre ítems. Por defecto: "/" */
  separator?: React.ReactNode;
};

function slugToLabel(slug: string, segmentLabels?: Record<string, string>): string {
  if (segmentLabels?.[slug]) return segmentLabels[slug];
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function Breadcrumb({
  root = { label: "Inicio", href: "/" },
  firstSegment,
  segmentLabels,
  staticOnly = false,
  className,
  separator = "/",
}: BreadcrumbProps) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [root];

  if (firstSegment && pathSegments.length > 0) {
    items.push(firstSegment);
  }

  if (!staticOnly && pathSegments.length > 0) {
    let startIndex = firstSegment ? 1 : 0;
    let basePath = firstSegment ? firstSegment.href : "";

    for (let i = startIndex; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      basePath = basePath ? `${basePath}/${segment}` : `/${segment}`;
      items.push({
        label: slugToLabel(segment, segmentLabels),
        href: basePath,
      });
    }
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex my-4 items-center gap-1.5 text-sm text-muted-foreground", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="select-none text-muted-foreground/70" aria-hidden>
                {separator}
              </span>
            )}
            {isLast ? (
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
