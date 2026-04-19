"use client";

import { useState } from "react";

interface RecipeActionsProps {
  title: string;
  description: string;
}

export default function RecipeActions({ title, description }: RecipeActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title,
      text: description,
      url: window.location.href,
    };

    // Try native share (mobile / supported browsers)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or error — fall through to clipboard
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <div className="recipe-actions">
      {/* Save — no functionality yet */}
      <button className="recipe-actions__icon-btn" aria-label="Save recipe" disabled>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
        <span>Guardar</span>
      </button>

      {/* Share — functional */}
      <button className="recipe-actions__icon-btn" aria-label="Share recipe" onClick={handleShare}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        <span>{copied ? "¡Compartido!" : "Compartir"}</span>
      </button>
    </div>
  );
}
