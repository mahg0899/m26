"use client";

import { useState, useEffect, useCallback } from "react";

interface Ingredient {
  id: string;
  text: string;
}

interface IngredientListProps {
  recipeSlug: string;
  ingredients: Ingredient[];
}

function getStorageKey(slug: string) {
  return `m26:recipe:${slug}:checked`;
}

export default function IngredientList({
  recipeSlug,
  ingredients,
}: IngredientListProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // ── Load from localStorage on mount ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(getStorageKey(recipeSlug));
      if (raw) {
        setChecked(JSON.parse(raw));
      }
    } catch {
      // Silently ignore corrupt/missing data
    }
    setHydrated(true);
  }, [recipeSlug]);

  // ── Persist to localStorage whenever checked changes ──
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        getStorageKey(recipeSlug),
        JSON.stringify(checked)
      );
    } catch {
      // Storage full or unavailable — ignore
    }
  }, [checked, hydrated, recipeSlug]);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked = checkedCount === ingredients.length;

  const clearAll = useCallback(() => {
    setChecked({});
  }, []);

  return (
    <div className="recipe-ingredients">
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

      {/* Progress bar */}
      <div className="recipe-ingredients__progress">
        <div
          className="recipe-ingredients__progress-fill"
          style={{ width: `${(checkedCount / ingredients.length) * 100}%` }}
        />
      </div>
      <span className="recipe-ingredients__counter">
        {checkedCount}/{ingredients.length}
      </span>

      <ul className="recipe-ingredients__list">
        {ingredients.map((ing) => {
          const isChecked = hydrated ? !!checked[ing.id] : false;
          return (
            <li
              key={ing.id}
              className={`recipe-ingredient ${isChecked ? "recipe-ingredient--checked" : ""}`}
              onClick={() => toggle(ing.id)}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(ing.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={ing.text}
              />
              <span className="recipe-ingredient__text">{ing.text}</span>
            </li>
          );
        })}
      </ul>

      {allChecked && checkedCount > 0 && (
        <p className="recipe-ingredients__done">✓ ¡Todos los ingredientes listos!</p>
      )}
    </div>
  );
}
