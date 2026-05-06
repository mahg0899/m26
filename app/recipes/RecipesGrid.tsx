"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import type { Recipe, TimeFilter, FlavorFilter } from "@/lib/pocketbase";
import { getAssetURL } from "@/lib/pocketbase";

// ── Constantes ────────────────────────────────────────────────────────────────

const GROUP_SIZE = 5; // 2 editorial + 3 bento
const PER_PAGE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

const DifficultyLabels: Record<string, string> = {
  effortless: "Sin esfuerzo",
  easy: "Fácil",
  medium: "Moderado",
  advanced: "Avanzado",
};

const FlavorLabels: Record<string, string> = {
  dulce: "Dulce",
  salado: "Salado",
  mixto: "Mixto",
};

function prepTimeLabel(mins: number | null): string | null {
  if (!mins) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

function buildUrl(
  page: number,
  perPage: number,
  time: TimeFilter | null,
  flavor: FlavorFilter | null
): string {
  const p = new URLSearchParams({ page: String(page), perPage: String(perPage) });
  if (time) p.set("time", time);
  if (flavor) p.set("flavor", flavor);
  return `/api/recipes?${p.toString()}`;
}

// ── RecipeImage ───────────────────────────────────────────────────────────────

function RecipeImage({
  recipe, width, quality, className, placeholderClassName,
}: {
  recipe: Recipe; width: number; quality: number;
  className: string; placeholderClassName: string;
}) {
  const src = getAssetURL(recipe.id, recipe.image, { width, quality });
  if (src) return <img src={src} alt={recipe.title} className={className} />;
  return (
    <div className={placeholderClassName}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1" width="36" height="36" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

// ── FeaturedCard ──────────────────────────────────────────────────────────────

function FeaturedCard({ recipe }: { recipe: Recipe }) {
  const timeLabel = prepTimeLabel(recipe.prep_time);
  const diffLabel = recipe.difficulty ? DifficultyLabels[recipe.difficulty] : null;
  const tag = recipe.collection_label;
  return (
    <div className="recipes-primary-block">
      <Link href={`/recipes/${recipe.slug}`} className="recipe-featured-card">
        <div className="recipe-featured-card__tags">
          {tag && <span className="recipe-tag">{tag}</span>}
          {recipe.flavor && (
            <span className={`recipe-tag${tag ? " recipe-tag--dot" : ""}`}>
              {FlavorLabels[recipe.flavor] ?? recipe.flavor}
            </span>
          )}
          {timeLabel && (
            <span className={`recipe-tag recipe-tag--time${(tag || recipe.flavor) ? " recipe-tag--dot" : ""}`}>
              {timeLabel}
            </span>
          )}
        </div>
        <h2 className="recipe-featured-card__title">{recipe.title}</h2>
        {recipe.description && <p className="recipe-featured-card__desc">{recipe.description}</p>}
        <div className="recipe-featured-card__footer">
          {diffLabel && <span className="recipe-skill-label">{diffLabel}</span>}
          <button className="recipe-save-btn" aria-label="Guardar receta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </Link>
      <Link href={`/recipes/${recipe.slug}`} className="recipes-hero-image" aria-label={recipe.title}>
        <RecipeImage recipe={recipe} width={900} quality={85}
          className="recipes-hero-image__img"
          placeholderClassName="recipes-hero-image__placeholder" />
      </Link>
    </div>
  );
}

// ── SideCard ──────────────────────────────────────────────────────────────────

function SideCard({ recipe }: { recipe: Recipe }) {
  const timeLabel = prepTimeLabel(recipe.prep_time);
  const diffLabel = recipe.difficulty ? DifficultyLabels[recipe.difficulty] : null;
  const tag = recipe.collection_label;
  return (
    <Link href={`/recipes/${recipe.slug}`} className="recipe-side-card">
      <div className="recipe-side-card__image">
        <RecipeImage recipe={recipe} width={600} quality={80}
          className="recipe-side-card__img"
          placeholderClassName="recipe-side-card__image-placeholder" />
      </div>
      <div className="recipe-side-card__body">
        <div className="recipe-side-card__tags">
          {tag && <span className="recipe-tag">{tag}</span>}
          {recipe.flavor && (
            <span className={`recipe-tag${tag ? " recipe-tag--dot" : ""}`}>
              {FlavorLabels[recipe.flavor] ?? recipe.flavor}
            </span>
          )}
          {timeLabel && (
            <span className={`recipe-tag recipe-tag--time${(tag || recipe.flavor) ? " recipe-tag--dot" : ""}`}>
              {timeLabel}
            </span>
          )}
        </div>
        <h3 className="recipe-side-card__title">{recipe.title}</h3>
        {recipe.description && <p className="recipe-side-card__desc">{recipe.description}</p>}
        <div className="recipe-side-card__footer">
          {diffLabel && <span className="recipe-skill-label">{diffLabel}</span>}
          <button className="recipe-save-btn" aria-label="Guardar receta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── MiniCard ──────────────────────────────────────────────────────────────────

function MiniCard({ recipe, wide }: { recipe: Recipe; wide?: boolean }) {
  const timeLabel = prepTimeLabel(recipe.prep_time);
  const diffLabel = recipe.difficulty ? DifficultyLabels[recipe.difficulty] : null;
  const tag = recipe.collection_label;
  const imgSrc = getAssetURL(recipe.id, recipe.image, { width: 400, quality: 75 });
  return (
    <Link href={`/recipes/${recipe.slug}`}
      className={`recipe-mini-card recipe-mini-card--${wide ? "wide" : "square"}`}>
      {wide && imgSrc && <img src={imgSrc} alt="" className="recipe-mini-card__bg" aria-hidden="true" />}
      {!wide && (imgSrc
        ? <img src={imgSrc} alt={recipe.title} className="recipe-mini-card__thumb" />
        : <span className="recipe-mini-card__emoji" aria-hidden="true">🍽️</span>
      )}
      <div className="recipe-mini-card__content">
        <div className="recipe-mini-card__tags">
          {tag && <span className="recipe-tag">{tag}</span>}
          {recipe.flavor && (
            <span className={`recipe-tag${tag ? " recipe-tag--dot" : ""}`}>
              {FlavorLabels[recipe.flavor] ?? recipe.flavor}
            </span>
          )}
          {timeLabel && (
            <span className={`recipe-tag recipe-tag--time${(tag || recipe.flavor) ? " recipe-tag--dot" : ""}`}>
              {timeLabel}
            </span>
          )}
        </div>
        <h3 className="recipe-mini-card__title">{recipe.title}</h3>
        {recipe.description && <p className="recipe-mini-card__desc">{recipe.description}</p>}
      </div>
      <div className="recipe-mini-card__footer">
        {diffLabel && <span className="recipe-skill-label">{diffLabel}</span>}
        <button className="recipe-save-btn" aria-label="Guardar receta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    </Link>
  );
}

// ── RecipeGroup ───────────────────────────────────────────────────────────────

function RecipeGroup({ recipes, groupIndex }: { recipes: Recipe[]; groupIndex: number }) {
  const inverted = groupIndex % 2 === 1;
  const featured = recipes[0];
  const side = recipes[1];
  const mini = recipes.slice(2, 5);
  return (
    <div className="recipes-group">
      {(featured || side) && (
        <div className={`recipes-editorial-grid${inverted ? " recipes-editorial-grid--inverted" : ""}`}>
          {inverted
            ? <>{side && <SideCard recipe={side} />}{featured && <FeaturedCard recipe={featured} />}</>
            : <>{featured && <FeaturedCard recipe={featured} />}{side && <SideCard recipe={side} />}</>
          }
        </div>
      )}
      {mini.length > 0 && (
        <div className="recipes-bento-grid">
          {mini.map((r, i) => <MiniCard key={r.id} recipe={r} wide={i === 0} />)}
        </div>
      )}
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="recipes-empty">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1" width="48" height="48" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <p>{filtered ? "Sin recetas para estos filtros." : "Aún no hay recetas publicadas."}</p>
      {filtered && <p className="recipes-empty__hint">Prueba cambiando los filtros.</p>}
    </div>
  );
}

// ── RecipesGrid ───────────────────────────────────────────────────────────────

export function RecipesGrid({
  initialRecipes,
  initialTotal,
}: {
  initialRecipes: Recipe[];
  initialTotal: number;
}) {
  // ── Filter state ──
  const [timeFilter, setTimeFilter] = useState<TimeFilter | null>(null);
  const [flavorFilter, setFlavorFilter] = useState<FlavorFilter | null>(null);

  // Refs so loadMore always reads the latest filter values without being recreated
  const timeRef = useRef<TimeFilter | null>(null);
  const flavorRef = useRef<FlavorFilter | null>(null);
  timeRef.current = timeFilter;
  flavorRef.current = flavorFilter;

  // ── Recipe list state ──
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [total, setTotal] = useState(initialTotal);
  const [nextPage, setNextPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const hasMore = recipes.length < total;

  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Apply filters: reset list + fetch page 1 ──
  const applyFilters = useCallback(async (
    time: TimeFilter | null,
    flavor: FlavorFilter | null
  ) => {
    // No filters → restore SSR snapshot
    if (!time && !flavor) {
      setRecipes(initialRecipes);
      setTotal(initialTotal);
      setNextPage(2);
      return;
    }
    setLoading(true);
    setRecipes([]);
    try {
      const res = await fetch(buildUrl(1, PER_PAGE, time, flavor));
      const data: { items: Recipe[]; totalItems: number } = await res.json();
      setRecipes(data.items);
      setTotal(data.totalItems);
      setNextPage(2);
    } catch (err) {
      console.error("[RecipesGrid] applyFilters:", err);
    } finally {
      setLoading(false);
    }
  }, [initialRecipes, initialTotal]);

  // ── Toggle helpers ──
  function toggleTime(value: TimeFilter) {
    const next = timeFilter === value ? null : value;
    setTimeFilter(next);
    applyFilters(next, flavorFilter);
  }

  function toggleFlavor(value: FlavorFilter) {
    const next = flavorFilter === value ? null : value;
    setFlavorFilter(next);
    applyFilters(timeFilter, next);
  }

  // ── Infinite scroll: load next page ──
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const url = buildUrl(nextPage, PER_PAGE, timeRef.current, flavorRef.current);
      const res = await fetch(url);
      const data: { items: Recipe[]; totalItems: number } = await res.json();
      setRecipes(prev => [...prev, ...data.items]);
      setTotal(data.totalItems);
      setNextPage(p => p + 1);
    } catch (err) {
      console.error("[RecipesGrid] loadMore:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, nextPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // ── Pill class helper ──
  const timeCls = (v: TimeFilter) => `recipes-pill${timeFilter === v ? " recipes-pill--active" : ""}`;
  const flavorCls = (v: FlavorFilter) => `recipes-pill${flavorFilter === v ? " recipes-pill--accent" : ""}`;

  const isFiltered = Boolean(timeFilter || flavorFilter);
  const groups: Recipe[][] = [];
  for (let i = 0; i < recipes.length; i += GROUP_SIZE) groups.push(recipes.slice(i, i + GROUP_SIZE));

  return (
    <>
      {/* ── Filtros ── */}
      <div className="recipes-filters">
        <div className="recipes-filter-group">
          <span className="recipes-filter-label">Tiempo de Preparación</span>
          <div className="recipes-filter-pills">
            <button className={timeCls("lt15")} onClick={() => toggleTime("lt15")}>Menos de 15 min</button>
            <button className={timeCls("lt30")} onClick={() => toggleTime("lt30")}>30 Minutos</button>
            <button className={timeCls("gte60")} onClick={() => toggleTime("gte60")}>60 Minutos +</button>
          </div>
        </div>

        <div className="recipes-filter-group">
          <span className="recipes-filter-label">Perfil de Sabor</span>
          <div className="recipes-filter-pills">
            <button className={flavorCls("dulce")} onClick={() => toggleFlavor("dulce")}>Dulce</button>
            <button className={flavorCls("salado")} onClick={() => toggleFlavor("salado")}>Salado</button>
            <button className={flavorCls("mixto")} onClick={() => toggleFlavor("mixto")}>Mixto</button>
          </div>
        </div>

        {isFiltered && (
          <button
            className="recipes-clear-filters"
            onClick={() => { setTimeFilter(null); setFlavorFilter(null); applyFilters(null, null); }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Limpiar
          </button>
        )}
      </div>

      {/* ── Grid ── */}
      {loading && recipes.length === 0 ? (
        <div className="recipes-sentinel">
          <div className="recipes-loading" role="status" aria-label="Cargando recetas">
            <span /><span /><span />
          </div>
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState filtered={isFiltered} />
      ) : (
        <>
          {groups.map((group, idx) => (
            <RecipeGroup key={`${timeFilter}-${flavorFilter}-${idx}`} recipes={group} groupIndex={idx} />
          ))}
        </>
      )}

      {/* Sentinel para infinite scroll */}
      <div ref={sentinelRef} className="recipes-sentinel" aria-hidden="true">
        {loading && recipes.length > 0 && (
          <div className="recipes-loading" role="status" aria-label="Cargando más recetas">
            <span /><span /><span />
          </div>
        )}
        {!hasMore && recipes.length > 0 && (
          <p className="recipes-end">— fin de la colección —</p>
        )}
      </div>
    </>
  );
}
