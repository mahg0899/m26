"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import RecipeNotes from "./RecipeNotes";

interface RecipeBodyProps {
  recipeSlug: string;
  html: string;
}

// ── Types for parsed blocks ──

type Block =
  | { type: "ingredients"; items: string[] }
  | { type: "steps"; items: { title: string; body: string; duration: string | null }[] }
  | { type: "html"; content: string };

// ── Parse HTML body into typed blocks ──

function parseRecipeBody(html: string): Block[] {
  const blocks: Block[] = [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const children = Array.from(doc.body.children);

  let i = 0;
  while (i < children.length) {
    const el = children[i];

    // Check if it's a heading followed by a list
    if (el.tagName === "H2") {
      const next = children[i + 1];

      // H2 + UL = Ingredients block
      if (next?.tagName === "UL") {
        const items = Array.from(next.querySelectorAll("li")).map(
          (li) => li.textContent?.trim() || ""
        );
        blocks.push({ type: "ingredients", items });
        i += 2;
        continue;
      }

      // H2 + OL = Steps block
      if (next?.tagName === "OL") {
        const items = Array.from(next.querySelectorAll("li")).map((li) => {
          const strong = li.querySelector("strong");
          const title = strong?.textContent?.trim() || "";
          let body = li.innerHTML;
          if (strong) {
            body = body
              .replace(/<strong>.*?<\/strong>/, "")
              .replace(/^\s*[—–\-]\s*/, "")
              .trim();
          }
          // Extract duration from [X min] pattern
          const durationMatch = body.match(/\[(\d+\s*(?:h(?:oras?|rs?)?|min(?:utos?)?)(?:\s*\d+\s*(?:min(?:utos?)?))?)\]/i);
          const duration = durationMatch ? durationMatch[1] : null;
          if (durationMatch) {
            body = body.replace(durationMatch[0], "").trim();
          }
          return { title, body, duration };
        });
        blocks.push({ type: "steps", items });
        i += 2;
        continue;
      }
    }

    // Standalone lists without headings
    if (el.tagName === "UL") {
      const items = Array.from(el.querySelectorAll("li")).map(
        (li) => li.textContent?.trim() || ""
      );
      blocks.push({ type: "ingredients", items });
      i++;
      continue;
    }

    if (el.tagName === "OL") {
      const items = Array.from(el.querySelectorAll("li")).map((li) => {
        const strong = li.querySelector("strong");
        const title = strong?.textContent?.trim() || "";
        let body = li.innerHTML;
        if (strong) {
          body = body
            .replace(/<strong>.*?<\/strong>/, "")
            .replace(/^\s*[—–\-]\s*/, "")
            .trim();
        }
        const durationMatch = body.match(/\[(\d+\s*(?:h(?:oras?|rs?)?|min(?:utos?)?)(?:\s*\d+\s*(?:min(?:utos?)?))?)\]/i);
        const duration = durationMatch ? durationMatch[1] : null;
        if (durationMatch) {
          body = body.replace(durationMatch[0], "").trim();
        }
        return { title, body, duration };
      });
      blocks.push({ type: "steps", items });
      i++;
      continue;
    }

    // Anything else is passed through as HTML
    blocks.push({ type: "html", content: el.outerHTML });
    i++;
  }

  return blocks;
}

// ── LocalStorage helpers ──

function getCheckedKey(slug: string) {
  return `m26:recipe:${slug}:checked`;
}

// ── Main component ──

export default function RecipeBody({ recipeSlug, html }: RecipeBodyProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Parse HTML only on the client (DOMParser is browser-only)
  useEffect(() => {
    setBlocks(parseRecipeBody(html));
  }, [html]);

  // Separate blocks into left (ingredients) and right (steps) + extras
  const leftBlocks = useMemo(
    () => blocks.filter((b) => b.type === "ingredients"),
    [blocks]
  );
  const rightBlocks = useMemo(
    () => blocks.filter((b) => b.type === "steps"),
    [blocks]
  );
  const extraBlocks = useMemo(
    () => blocks.filter((b) => b.type === "html"),
    [blocks]
  );

  const allIngredients = useMemo(
    () => leftBlocks.flatMap((b) => (b.type === "ingredients" ? b.items : [])),
    [leftBlocks]
  );

  // ── Load checked state from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(getCheckedKey(recipeSlug));
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, [recipeSlug]);

  // ── Persist checked state ──
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(getCheckedKey(recipeSlug), JSON.stringify(checked));
    } catch {
      // ignore
    }
  }, [checked, hydrated, recipeSlug]);

  const toggle = useCallback((key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const clearAll = useCallback(() => setChecked({}), []);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked =
    checkedCount === allIngredients.length && allIngredients.length > 0;

  let ingredientIdx = 0;

  return (
    <>
      {/* ── Left column: ingredients ── */}
      <div className="recipe-body__left">
        {leftBlocks.map((block, blockIdx) => {
          if (block.type !== "ingredients") return null;
          const startIdx = ingredientIdx;
          ingredientIdx += block.items.length;

          return (
            <div key={`ing-${blockIdx}`} className="recipe-ingredients">
              <div className="recipe-ingredients__header">
                <h2 className="recipe-section-title">Ingredientes</h2>
                {checkedCount > 0 && (
                  <button
                    className="recipe-ingredients__clear"
                    onClick={clearAll}
                    aria-label="Borrar todos los ingredientes marcados"
                  >
                    Borrar
                  </button>
                )}
              </div>

              <div className="recipe-ingredients__progress">
                <div
                  className="recipe-ingredients__progress-fill"
                  style={{
                    width: `${(checkedCount / allIngredients.length) * 100}%`,
                  }}
                />
              </div>
              <span className="recipe-ingredients__counter">
                {checkedCount}/{allIngredients.length}
              </span>

              <ul className="recipe-ingredients__list">
                {block.items.map((text, i) => {
                  const key = `ing-${startIdx + i}`;
                  const isChecked = hydrated ? !!checked[key] : false;
                  return (
                    <li
                      key={key}
                      className={`recipe-ingredient ${isChecked ? "recipe-ingredient--checked" : ""}`}
                      onClick={() => toggle(key)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(key)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={text}
                      />
                      <span className="recipe-ingredient__text">{text}</span>
                    </li>
                  );
                })}
              </ul>

              {allChecked && (
                <p className="recipe-ingredients__done">
                  ✓ ¡Todos los ingredientes listos!
                </p>
              )}
            </div>
          );
        })}
        <RecipeNotes recipeSlug={recipeSlug} />
      </div>

      {/* ── Right column: steps ── */}
      {rightBlocks.map((block, blockIdx) => {
        if (block.type !== "steps") return null;
        return (
          <div key={`steps-${blockIdx}`} className="recipe-ritual">
            <h2 className="recipe-ritual__title">El Procedimiento</h2>
            <p className="recipe-ritual__subtitle">
              Una ruta de pasos para lograr un resultado delicioso
            </p>
            {block.items.map((step, i) => (
              <div className="recipe-step" key={i}>
                <span className="recipe-step__number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="recipe-step__content">
                  {step.title && (
                    <h3 className="recipe-step__title">{step.title}</h3>
                  )}
                  <p
                    className="recipe-step__desc"
                    dangerouslySetInnerHTML={{ __html: step.body }}
                  />
                  {step.duration && (
                    <span className="recipe-step__duration">
                      ⏱ {step.duration}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {/* ── Extra content (prose) ── */}
      {extraBlocks.length > 0 && (
        <div className="recipe-prose">
          {extraBlocks.map((block, i) => (
            <div
              key={`html-${i}`}
              dangerouslySetInnerHTML={{ __html: (block as { type: "html"; content: string }).content }}
            />
          ))}
        </div>
      )}
    </>
  );
}
