export const dynamic = 'force-dynamic'

import Link from "next/link";
import { getPublishedRecipes, getAssetURL, getFeaturedCollection } from "@/lib/pocketbase";
import ScrollRow from "@/app/components/ScrollRow";
import "./hero.css";

const DifficultyLabels: Record<string, string> = {
  effortless: "Sin esfuerzo",
  easy: "Fácil",
  medium: "Medio",
  advanced: "Avanzado",
};

export default async function Home() {
  const [recipes, featuredLabel] = await Promise.all([
    getPublishedRecipes(),
    getFeaturedCollection(),
  ]);
  const latest = recipes[0] || null;

  const heroImage = latest
    ? getAssetURL(latest.id, latest.image, { width: "1200", quality: "85" })
    : null;

  // Featured collection: recipes matching the configured season (hero included)
  const collectionRecipes = featuredLabel
    ? recipes.filter(r => r.collection_label === featuredLabel)
    : [];

  return (
    <div className="home">
      {/* ── Hero: latest recipe ── */}
      {latest ? (
        <Link href={`/recipes/${latest.slug}`} className="hero-card">
          {heroImage && (
            <img
              src={heroImage}
              alt={latest.title}
              className="hero-card__img"
            />
          )}
          <div className="hero-card__gradient" />
          <div className="hero-card__content">
            {latest.collection_label && (
              <span className="hero-card__label">{latest.collection_label}</span>
            )}
            <h1 className="hero-card__title">{latest.title}</h1>
            {latest.description && (
              <p className="hero-card__desc">{latest.description}</p>
            )}
            <div className="hero-card__meta">
              {latest.prep_time && <span><strong>⏱ Prep</strong> {latest.prep_time} min</span>}
              {latest.difficulty && <span><strong>Dificultad</strong> {DifficultyLabels[latest.difficulty]}</span>}
              {latest.servings && <span><strong>Porciones</strong> {latest.servings}</span>}
            </div>
          </div>
        </Link>
      ) : (
        <div className="hero-card hero-card--empty">
          <div className="hero-card__content">
            <h1 className="hero-card__title">Aún no hay recetas</h1>
            <p className="hero-card__desc">Crea tu primera receta desde el panel de administración.</p>
          </div>
        </div>
      )}

      {/* ── Seasonal collection ── */}
      {collectionRecipes.length > 0 && (
        <section className="season">
          <div className="season__header">
            <div>
              <h2 className="season__title">{featuredLabel}</h2>
              <div className="season__line" />
            </div>
            <Link href="/recipes" className="season__link">
              Ver todas →
            </Link>
          </div>
          <ScrollRow>
            {collectionRecipes.map((recipe) => {
              const img = getAssetURL(recipe.id, recipe.image, { width: "600", quality: "80" });
              return (
                <Link key={recipe.id} href={`/recipes/${recipe.slug}`} className="rcard">
                  <div className="rcard__img-wrap">
                    {img ? (
                      <img src={img} alt={recipe.title} className="rcard__img" />
                    ) : (
                      <div className="rcard__img-empty">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="32" height="32">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="rcard__body">
                    <h3 className="rcard__title">{recipe.title}</h3>
                    <div className="rcard__meta">
                      {recipe.prep_time && <span>{recipe.prep_time} min</span>}
                      {recipe.difficulty && <span>{DifficultyLabels[recipe.difficulty]}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </ScrollRow>
        </section>
      )}
    </div>
  );
}