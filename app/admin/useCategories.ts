"use client";

import { useState, useEffect } from "react";

const PB_URL = "/api/pb";

/**
 * Hook que devuelve la lista de nombres de categorías.
 * Fuente primaria: colección `categories` en PocketBase.
 * Fallback: valores únicos de collection_label en recetas.
 */
export function useCategories(token: string | null): string[] {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    // 1. Intentar desde la colección `categories`
    fetch(`${PB_URL}/api/collections/categories/records?sort=name&perPage=500`, { headers })
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          const names: string[] = (data.items ?? []).map((c: { name: string }) => c.name);
          if (names.length > 0) {
            setCategories(names);
            return; // ya tenemos datos, no necesitamos el fallback
          }
        }
        // 2. Fallback: derivar de collection_label en recetas
        const recipesRes = await fetch(
          `${PB_URL}/api/collections/recipes/records?fields=id,collection_label&perPage=500`,
          { headers }
        );
        if (!recipesRes.ok) return;
        const recipesData = await recipesRes.json();
        const unique = Array.from(
          new Set(
            (recipesData.items ?? [])
              .map((r: { collection_label: string | null }) => r.collection_label)
              .filter(Boolean)
          )
        ).sort() as string[];
        setCategories(unique);
      })
      .catch(() => {});
  }, [token]);

  return categories;
}
