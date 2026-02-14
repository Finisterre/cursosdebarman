"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { deleteBannerAction } from "@/app/(app)/(admin)/admin/banners/actions";

type DeleteBannerButtonProps = {
  bannerId: string;
  bannerTitle: string;
};

export function DeleteBannerButton({
  bannerId,
  bannerTitle,
}: DeleteBannerButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = () => {
    const toastResult = toast({
      variant: "destructive",
      title: "¿Eliminar banner?",
      description: `¿Eliminar "${bannerTitle}"? No se puede deshacer.`,
      action: (
        <Button
          size="sm"
          variant="outline"
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={async () => {
            setIsDeleting(true);
            const result = await deleteBannerAction(bannerId);
            setIsDeleting(false);
            toastResult.dismiss();
            if (result.ok) {
              toast({ title: "Banner eliminado" });
              router.refresh();
            } else {
              toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
              });
            }
          }}
        >
          Eliminar
        </Button>
      ),
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleClick}
      disabled={isDeleting}
      aria-label={`Borrar ${bannerTitle}`}
    >
      <Trash2 size={16} />
    </Button>
  );
}
