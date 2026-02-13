"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/app/(app)/(admin)/admin/categories/actions";

type DeleteCategoryButtonProps = {
  categoryId: string;
  categoryName: string;
  hasChildren?: boolean;
};

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  hasChildren = false,
}: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = () => {
    const message = hasChildren
      ? `¿Eliminar "${categoryName}" y sus subcategorías? No se puede deshacer.`
      : `¿Eliminar "${categoryName}"? No se puede deshacer.`;

    const toastResult = toast({
      variant: "destructive",
      title: "¿Eliminar categoría?",
      description: message,
      action: (
        <Button
          size="sm"
          variant="outline"
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={async () => {
            setIsDeleting(true);
            const result = await deleteCategoryAction(categoryId);
            setIsDeleting(false);
            toastResult.dismiss();
            if (result.ok) {
              toast({ title: "Categoría eliminada" });
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
      aria-label={`Borrar ${categoryName}`}
    >
      <Trash2 size={16} />
    </Button>
  );
}
