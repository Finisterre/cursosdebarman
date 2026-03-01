"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { deleteProductAction } from "@/app/(app)/(admin)/admin/products/actions";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = () => {
    const toastResult = toast({
      variant: "destructive",
      title: "¿Eliminar producto?",
      description:
        "Se eliminará el producto y todas sus variantes. Esta acción no se puede deshacer.",
      action: (
        <Button
          size="sm"
          variant="outline"
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
          onClick={async () => {
            setIsDeleting(true);
            const result = await deleteProductAction(productId);
            setIsDeleting(false);
            toastResult.dismiss();
            if (result.ok) {
              toast({
                title: "Producto eliminado",
                description: `"${productName}" y sus variantes fueron eliminados.`,
              });
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
      aria-label={`Borrar ${productName}`}
    >
      <Trash2 size={16} />
    </Button>
  );
}
