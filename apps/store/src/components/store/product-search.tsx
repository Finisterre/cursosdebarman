"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function ProductSearch({
  defaultValue = "",
  onNavigate,
}: {
  defaultValue?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const q = defaultValue || (searchParams.get("q") ?? "");

  return (
    <form
      action="/products"
      method="get"
      className="flex w-full max-w-md gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const value = inputRef.current?.value?.trim() ?? "";
        const params = new URLSearchParams();
        if (value) params.set("q", value);
        onNavigate?.();
        router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre..."
          className="pl-9"
          aria-label="Buscar productos"
        />
      </div>
      <Button type="submit" variant="secondary" size="default">
        Buscar
      </Button>
    </form>
  );
}
