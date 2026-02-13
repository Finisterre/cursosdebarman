import { BannerForm } from "@/components/admin/banner-form";
import { createBannerAction } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/banners">← Banners</Link>
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-semibold">Nuevo banner</h1>
        <p className="text-sm text-muted-foreground">
          Creá un banner para la home u otras posiciones. Elegí tipo y posición según dónde quieras mostrarlo.
        </p>
      </div>
      <BannerForm createBannerAction={createBannerAction} />
    </div>
  );
}
