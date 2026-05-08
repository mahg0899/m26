"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

interface NoteEntry {
  slug: string;
  content: string;
  storageKey: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const NOTE_KEY_PATTERN = /^m26:recipe:(.+):notes$/;

function getAllNotes(): NoteEntry[] {
  const entries: NoteEntry[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const match = key.match(NOTE_KEY_PATTERN);
      if (!match) continue;
      const content = localStorage.getItem(key) || "";
      if (!content.trim()) continue;
      entries.push({ slug: match[1], content, storageKey: key });
    }
  } catch {
    // localStorage unavailable (SSR guard)
  }
  return entries;
}

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── NoteCard ─────────────────────────────────────────────────────────────────

interface NoteCardProps {
  entry: NoteEntry;
  onDelete: (key: string) => void;
  onSave: (key: string, content: string) => void;
}

function NoteCard({ entry, onDelete, onSave }: NoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.content);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSave(entry.storageKey, value);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }, 800);
    },
    [entry.storageKey, onSave]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft(value);
    persist(value);
  };

  // Save immediately on blur (same pattern as RecipeNotes)
  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSave(entry.storageKey, draft);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
    setEditing(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const label = slugToLabel(entry.slug);

  return (
    <article className="nc-card">
      {/* ── Header ── */}
      <header className="nc-card__header">
        <div className="nc-card__meta">
          <span className="nc-card__icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </span>
          <h2 className="nc-card__title">{label}</h2>
        </div>
        <div className="nc-card__actions">
          {saveStatus === "saved" && (
            <span className="nc-card__saved-badge">✓ Guardado</span>
          )}
          <button
            className="nc-btn nc-btn--danger"
            onClick={() => onDelete(entry.storageKey)}
            aria-label={`Eliminar nota de ${label}`}
            title="Eliminar"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="nc-card__body">
        {editing ? (
          <textarea
            className="nc-card__textarea"
            value={draft}
            onChange={handleChange}
            onBlur={handleBlur}
            autoFocus
            rows={5}
            aria-label={`Editar nota de ${label}`}
          />
        ) : (
          <div
            className="nc-card__text-box"
            onClick={() => setEditing(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setEditing(true)}
            aria-label={`Editar nota de ${label}`}
            title="Haz clic para editar"
          >
            <p className="nc-card__text">{draft}</p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="nc-card__footer">
        <Link
          href={`/recipes/${entry.slug}`}
          className="nc-card__link"
          aria-label={`Ir a receta ${label}`}
        >
          Ver receta
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </footer>
    </article>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="nc-empty">
      <div className="nc-empty__icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
      <p className="nc-empty__title">No has escrito notas</p>
      <p className="nc-empty__sub">
        Este espacio está reservado para tus notas de recetas favoritas.
      </p>
      <Link href="/recipes" className="nc-empty__cta">
        Explorar recetas
      </Link>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NotesCompendium() {
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setNotes(getAllNotes());
    setHydrated(true);
  }, []);

  const handleDelete = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
    } catch { }
    setNotes((prev) => prev.filter((n) => n.storageKey !== key));
  }, []);

  const handleSave = useCallback((key: string, content: string) => {
    try {
      if (content.trim()) {
        localStorage.setItem(key, content);
        setNotes((prev) =>
          prev.map((n) => (n.storageKey === key ? { ...n, content } : n))
        );
      } else {
        localStorage.removeItem(key);
        setNotes((prev) => prev.filter((n) => n.storageKey !== key));
      }
    } catch { }
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

  if (notes.length === 0) return <EmptyState />;

  return (
    <div className="nc-compendium">
      <p className="nc-count">
        {notes.length} {notes.length === 1 ? "nota guardada" : "notas guardadas"}
      </p>
      <div className="nc-grid">
        {notes.map((entry) => (
          <NoteCard
            key={entry.storageKey}
            entry={entry}
            onDelete={handleDelete}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  );
}
