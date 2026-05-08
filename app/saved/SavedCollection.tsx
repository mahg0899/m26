"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import "./saved.css";

// ── Constants ─────────────────────────────────────────────────────────────────

const SAVED_KEY_PATTERN = /^m26:recipe:(.+):saved$/;

// ── Types ─────────────────────────────────────────────────────────────────────

interface SavedEntry {
  slug: string;
  title: string;
  image: string | null;
  collectionLabel: string | null;
  prepTime: number | null;
  difficulty: string | null;
  storageKey: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DifficultyLabels: Record<string, string> = {
  effortless: "Sin esfuerzo",
  easy: "Fácil",
  medium: "Moderado",
  advanced: "Avanzado",
};

function getAllSaved(): SavedEntry[] {
  const entries: SavedEntry[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const match = key.match(SAVED_KEY_PATTERN);
      if (!match) continue;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const data = JSON.parse(raw);
        entries.push({ ...data, slug: match[1], storageKey: key });
      } catch {
        // malformed entry — skip
      }
    }
  } catch {
    // localStorage unavailable (SSR guard)
  }
  return entries;
}

export const SAVED_STORAGE_KEY = (slug: string) => `m26:recipe:${slug}:saved`;

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="sv-empty">
      <div className="sv-empty__icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      </div>
      <p className="sv-empty__title">Nada guardado aún</p>
      <p className="sv-empty__sub">
        Guarda recetas que quieras volver a encontrar fácilmente.
      </p>
      <Link href="/recipes" className="sv-empty__cta">
        Explorar recetas
      </Link>
    </div>
  );
}

// ── SavedCard ─────────────────────────────────────────────────────────────────

function SavedCard({
  entry,
  onRemove,
}: {
  entry: SavedEntry;
  onRemove: (key: string) => void;
}) {
  const [removing, setRemoving] = useState(false);

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRemoving(true);
    setTimeout(() => onRemove(entry.storageKey), 280);
  }

  const prepLabel = entry.prepTime
    ? entry.prepTime < 60
      ? `${entry.prepTime} min`
      : `${Math.floor(entry.prepTime / 60)} h${entry.prepTime % 60 ? ` ${entry.prepTime % 60} min` : ""}`
    : null;
  const diffLabel = entry.difficulty ? DifficultyLabels[entry.difficulty] : null;

  return (
    <article className={`sv-card${removing ? " sv-card--removing" : ""}`}>
      <Link href={`/recipes/${entry.slug}`} className="sv-card__link" tabIndex={-1} aria-hidden="true">
        {/* Image */}
        <div className="sv-card__img-wrap">
          {entry.image ? (
            <img src={entry.image} alt={entry.title} className="sv-card__img" />
          ) : (
            <div className="sv-card__img-empty" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1" width="32" height="32">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}

          {/* Remove bookmark overlay */}
          <button
            className="sv-card__bookmark"
            onClick={handleRemove}
            aria-label={`Quitar ${entry.title} de guardados`}
            title="Quitar de guardados"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill="currentColor" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </button>

          {entry.collectionLabel && (
            <span className="sv-card__collection">{entry.collectionLabel}</span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="sv-card__body">
        <Link href={`/recipes/${entry.slug}`} className="sv-card__title-link">
          <h2 className="sv-card__title">{entry.title}</h2>
        </Link>
        {(prepLabel || diffLabel) && (
          <p className="sv-card__meta">
            {prepLabel && <span>{prepLabel}</span>}
            {prepLabel && diffLabel && <span aria-hidden="true">·</span>}
            {diffLabel && <span>{diffLabel}</span>}
          </p>
        )}
      </div>
    </article>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SavedCollection() {
  const [entries, setEntries] = useState<SavedEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(getAllSaved());
    setHydrated(true);
  }, []);

  const handleRemove = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setEntries((prev) => prev.filter((e) => e.storageKey !== key));
  }, []);

  if (!hydrated) {
    return (
      <div className="nc-loading">
        <span className="nc-loading__dot" />
        <span className="nc-loading__dot" />
        <span className="nc-loading__dot" />
      </div>
    );
  }

  if (entries.length === 0) return <EmptyState />;

  return (
    <div className="sv-collection">
      <p className="sv-count">
        {entries.length} {entries.length === 1 ? "receta guardada" : "recetas guardadas"}
      </p>
      <div className="sv-grid">
        {entries.map((entry) => (
          <SavedCard key={entry.storageKey} entry={entry} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  );
}
