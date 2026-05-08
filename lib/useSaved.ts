"use client";

import { useState, useEffect, useCallback } from "react";

// ── Storage key ───────────────────────────────────────────────────────────────

export function savedKey(slug: string) {
  return `m26:recipe:${slug}:saved`;
}

// ── Payload stored per recipe ─────────────────────────────────────────────────

export interface SavedPayload {
  title: string;
  image: string | null;
  collectionLabel: string | null;
  prepTime: number | null;
  difficulty: string | null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSaved(slug: string, payload: SavedPayload) {
  const key = savedKey(slug);
  const [saved, setSaved] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      setSaved(localStorage.getItem(key) !== null);
    } catch {}
  }, [key]);

  const toggle = useCallback(() => {
    try {
      if (saved) {
        localStorage.removeItem(key);
        setSaved(false);
      } else {
        localStorage.setItem(key, JSON.stringify(payload));
        setSaved(true);
      }
    } catch {}
  }, [saved, key, payload]);

  return { saved, toggle };
}
