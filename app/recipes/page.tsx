import type { Metadata } from "next";
import { getPublishedRecipesPaginated } from "@/lib/pocketbase";
import { RecipesGrid } from "./RecipesGrid";
import "./recipes.css";

export const metadata: Metadata = {
  title: "Recetas",
  description: "Explora todas las recetas de Donum. Filtra por tiempo, sabor y más.",
  openGraph: { title: "Recetas | Donum", type: "website" },
};


const INITIAL_PER_PAGE = 10;

export default async function Recipes() {
  const { items, totalItems } = await getPublishedRecipesPaginated(1, INITIAL_PER_PAGE);

  return (
    <div className="page">
      <header className="page-header">
        <p className="page-header__label">Explora las preparaciones</p>
        <h1 className="page-header__title">Recetas</h1>
      </header>

      {/* Filtros + Grid con infinite scroll (client component) */}
      <RecipesGrid initialRecipes={items} initialTotal={totalItems} />
    </div>
  );
}