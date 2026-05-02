"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface RecipeNotesProps {
  recipeSlug: string;
}

function getStorageKey(slug: string) {
  return `m26:recipe:${slug}:notes`;
}

export default function RecipeNotes({ recipeSlug }: RecipeNotesProps) {
  const [note, setNote] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load from localStorage on mount ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(getStorageKey(recipeSlug));
      if (raw) setNote(raw);
    } catch { }
    setHydrated(true);
  }, [recipeSlug]);

  // ── Persist to localStorage with debounce ──
  const persistNote = useCallback(
    (value: string) => {
      try {
        localStorage.setItem(getStorageKey(recipeSlug), value);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch { }
    },
    [recipeSlug]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNote(value);
    setSaveStatus("saving");

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Save after 800ms of no typing
    debounceRef.current = setTimeout(() => {
      persistNote(value);
    }, 800);
  };

  // Save on blur (immediate, in case user leaves mid-typing)
  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    persistNote(note);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="recipe-notes">
      <h2 className="recipe-section-title">Notas Personales</h2>
      <p className="recipe-notes__placeholder">
        Escribe tus observaciones, cambios de ingredientes, etc.
      </p>
      <div className="recipe-notes__input">
        <textarea
          placeholder="Añade una nota privada…"
          value={hydrated ? note : ""}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={6}
        />
      </div>
      <div className="recipe-notes__footer">
        <span className="recipe-notes__hint">Sólo visible para tí</span>
        <span className="recipe-notes__status">
          {saveStatus === "saving" && "Guardando…"}
          {saveStatus === "saved" && "✓ Guardado"}
        </span>
      </div>
    </div>
  );
}
