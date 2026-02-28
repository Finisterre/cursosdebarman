"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 6;

export type ProductSearchResultItem = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  sale_price: number | null;
  image_url: string | null;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";

export function ProductSearch({
  defaultValue = "",
  onNavigate,
}: {
  defaultValue?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const initialQ = defaultValue || (searchParams.get("q") ?? "");
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<ProductSearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const fetchResults = useCallback(async (q: string) => {
    if (!q || q.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(q)}`,
        { signal: abortRef.current.signal }
      );
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setHighlightedIndex(-1);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (q: string) => {
      if (timer) clearTimeout(timer);
      if (!q || q.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setOpen(!!q);
        return;
      }
      timer = setTimeout(() => {
        setOpen(true);
        fetchResults(q);
      }, DEBOUNCE_MS);
    };
  }, [fetchResults]);

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      debouncedFetch(value);
    },
    [debouncedFetch]
  );

  const handleSelect = useCallback(
    (item: ProductSearchResultItem) => {
      onNavigate?.();
      setOpen(false);
      setResults([]);
      setHighlightedIndex(-1);
      router.push(`/products/${item.slug}`);
    },
    [router, onNavigate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open && e.key !== "Escape") return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((i) =>
            results.length ? Math.min(i + 1, results.length - 1) : -1
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((i) => (results.length ? Math.max(i - 1, -1) : -1));
          break;
        case "Enter":
          if (open && results.length > 0 && highlightedIndex >= 0) {
            e.preventDefault();
            handleSelect(results[highlightedIndex]!);
          }
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
        default:
          break;
      }
    },
    [open, results, highlightedIndex, handleSelect]
  );

  useEffect(() => {
    if (highlightedIndex < 0 || !listboxRef.current) return;
    const option = listboxRef.current.children[highlightedIndex] as HTMLElement;
    option?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightedIndex]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onOutside = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = inputRef.current?.value?.trim() ?? "";
      const params = new URLSearchParams();
      if (value) params.set("q", value);
      onNavigate?.();
      setOpen(false);
      router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [router, onNavigate]
  );

  const showDropdown = open && (query.length >= MIN_QUERY_LENGTH || results.length > 0);
  const displayPrice = (item: ProductSearchResultItem) =>
    item.sale_price != null && item.sale_price > 0
      ? item.sale_price
      : item.price;

  return (
    <form
      action="/products"
      method="get"
      className="flex w-full max-w-md gap-2"
      onSubmit={handleSubmit}
    >
      <div ref={containerRef} className="relative flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="search"
            name="q"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= MIN_QUERY_LENGTH && setOpen(true)}
            placeholder="Buscar por nombre..."
            className="pl-9"
            aria-label="Buscar productos"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="product-search-listbox"
            aria-activedescendant={
              highlightedIndex >= 0 && results[highlightedIndex]
                ? `product-option-${results[highlightedIndex]!.id}`
                : undefined
            }
            role="combobox"
            autoComplete="off"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>
              <Loader2 className="h-4 w-4 animate-spin" />
            </span>
          )}
        </div>

        {showDropdown && (
          <ul
            id="product-search-listbox"
            ref={listboxRef}
            role="listbox"
            aria-label="Resultados de búsqueda"
            className="absolute top-full left-0 z-50 mt-1 w-full max-h-80 overflow-y-auto rounded-md border bg-background shadow-lg"
          >
            {loading && results.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground" role="status">
                Buscando…
              </li>
            )}
            {!loading && query.length >= MIN_QUERY_LENGTH && results.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground" role="status">
                No se encontraron productos
              </li>
            )}
            {results.map((item, index) => (
              <li
                key={item.id}
                id={`product-option-${item.id}`}
                role="option"
                aria-selected={index === highlightedIndex}
                className={cn(
                  "flex cursor-pointer items-center gap-3 border-b border-border/50 px-3 py-2 last:border-b-0 transition-colors",
                  index === highlightedIndex && "bg-muted/50"
                )}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(item)}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                  <Image
                    src={item.image_url || FALLBACK_IMAGE}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {displayPrice(item) != null
                      ? `$${Number(displayPrice(item)).toLocaleString("es-AR")}`
                      : "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button type="submit" variant="secondary" size="default">
        Buscar
      </Button>
    </form>
  );
}
