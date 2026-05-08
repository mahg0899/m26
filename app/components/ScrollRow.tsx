"use client";

import { useRef } from "react";

export default function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const amount = 420;
    ref.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="scroll-row">
      <button
        type="button"
        className="scroll-row__arrow scroll-row__arrow--left"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => scroll("left")}
        aria-label="Anterior"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div ref={ref} className="scroll-row__track">
        {children}
      </div>
      <button
        type="button"
        className="scroll-row__arrow scroll-row__arrow--right"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => scroll("right")}
        aria-label="Siguiente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
