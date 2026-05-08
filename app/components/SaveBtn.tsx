"use client";

import { useSaved, type SavedPayload } from "@/lib/useSaved";

// Icono bookmark relleno (guardado) / outline (no guardado)
function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface SaveBtnProps {
  slug: string;
  payload: SavedPayload;
  className?: string;
  ariaLabel?: string;
}

export default function SaveBtn({ slug, payload, className = "recipe-save-btn", ariaLabel }: SaveBtnProps) {
  const { saved, toggle } = useSaved(slug, payload);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  }

  return (
    <button
      type="button"
      className={`${className}${saved ? " recipe-save-btn--saved" : ""}`}
      aria-label={ariaLabel ?? (saved ? "Quitar de guardados" : "Guardar receta")}
      title={saved ? "Quitar de guardados" : "Guardar receta"}
      onMouseDown={(e) => e.preventDefault()} // prevent focus scroll
      onClick={handleClick}
    >
      <BookmarkIcon filled={saved} />
    </button>
  );
}
