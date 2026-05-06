import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipeBySlug, getAssetURL } from "@/lib/pocketbase";
import RecipeBody from "./RecipeBody";
import RecipeNotes from "./RecipeNotes";
import RecipeActions from "./RecipeActions";
import "./recipe-slug.css";

const DIFFICULTY_LABELS: Record<string, string> = {
    effortless: "Sin esfuerzo",
    easy: "Fácil",
    medium: "Medio",
    advanced: "Avanzado",
};

const FLAVOR_LABELS: Record<string, string> = {
    dulce: "Dulce",
    salado: "Salado",
    mixto: "Mixto",
};

interface RecipePageProps {
    params: Promise<{ slug: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
    const { slug } = await params;

    const recipe = await getRecipeBySlug(slug);
    if (!recipe) notFound();

    const heroImage = getAssetURL(recipe.id, recipe.image, { width: "800", quality: "80" });

    return (
        <article className="recipe-page">
            {/* ── Hero: title + image ── */}
            <section className="recipe-hero">
                <div className="recipe-hero__text">
                    {recipe.collection_label && (
                        <div className="recipe-hero__label">
                            <span className="recipe-hero__label-line" />
                            <span className="recipe-hero__label-text">{recipe.collection_label}</span>
                        </div>
                    )}
                    <h1 className="recipe-hero__title">{recipe.title}</h1>
                    {recipe.description && (
                        <p className="recipe-hero__desc">{recipe.description}</p>
                    )}
                    <div className="recipe-hero__stats">
                        {recipe.prep_time && (
                            <div className="recipe-stat">
                                <span className="recipe-stat__label">T. Preparación</span>
                                <span className="recipe-stat__value">{recipe.prep_time} Mins</span>
                            </div>
                        )}

                        {recipe.difficulty && (
                            <div className="recipe-stat">
                                <span className="recipe-stat__label">Dificultad</span>
                                <span className="recipe-stat__value">
                                    {DIFFICULTY_LABELS[recipe.difficulty] || recipe.difficulty}
                                </span>
                            </div>
                        )}
                        {recipe.servings && (
                            <div className="recipe-stat">
                                <span className="recipe-stat__label">Porciones</span>
                                <span className="recipe-stat__value">{recipe.servings}</span>
                            </div>
                        )}
                        {recipe.flavor && (
                            <div className="recipe-stat">
                                <span className="recipe-stat__label">Sabor</span>
                                <span className="recipe-stat__value">
                                    {FLAVOR_LABELS[recipe.flavor] || recipe.flavor}
                                </span>
                            </div>
                        )}
                        <div className="recipe-stat recipe-stat--action" title="Comenzar a cocinar">
                            <button className="recipe-start-btn" aria-label="Start Cooking">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                                    <path className="recipe-start-btn__steam" d="M8 3c0 1.5-.5 2-1 3s-1 2.5 0 4" />
                                    <path className="recipe-start-btn__steam recipe-start-btn__steam--delay" d="M12 3c0 1.5-.5 2-1 3s-1 2.5 0 4" />
                                    <path className="recipe-start-btn__steam recipe-start-btn__steam--delay2" d="M16 3c0 1.5-.5 2-1 3s-1 2.5 0 4" />
                                    <path d="M2 12h20" />
                                    <path d="M4 12v5a3 3 0 003 3h10a3 3 0 003-3v-5" />
                                    <path d="M2 12h-0a1 1 0 010-2h0" />
                                    <path d="M22 12h0a1 1 0 010-2h0" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="recipe-hero__image">
                    {heroImage ? (
                        <img src={heroImage} alt={recipe.title} />
                    ) : (
                        <div className="recipe-hero__placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <span>Sin imagen</span>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Body: ingredients (left) + steps (right) parsed from rich text ── */}
            <RecipeBodySection recipeSlug={recipe.slug} body={recipe.body || ""} />

            {/* ── Actions ── */}
            <RecipeActions
                title={recipe.title}
                description={recipe.description || ""}
            />

            <Link href="/recipes" className="recipe-back">← Volver a recetas</Link>
        </article>
    );
}

// Wrapper that adds the grid + notes
function RecipeBodySection({ recipeSlug, body }: { recipeSlug: string; body: string }) {
    return (
        <section className="recipe-body">
            <RecipeBody recipeSlug={recipeSlug} html={body} />
        </section>
    );
}