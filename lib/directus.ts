import { createDirectus, rest, readItems } from "@directus/sdk";

// ── Types matching Directus collections ──

export interface Recipe {
  id: string;
  status: "draft" | "published" | "archived";
  date_created: string;
  date_updated: string | null;
  title: string;
  slug: string;
  description: string | null;
  collection_label: string | null;
  image: string | null; // file UUID
  prep_time: number | null;
  difficulty: "effortless" | "easy" | "medium" | "advanced" | null;
  servings: string | null;
  body: string | null; // rich text HTML — contains ingredients, steps, and prose
}

// ── Schema definition ──

interface DirectusSchema {
  recipes: Recipe[];
}

// ── Client ──

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055";

const directus = createDirectus<DirectusSchema>(DIRECTUS_URL).with(rest());

export default directus;

// ── Helper: get image URL ──

export function getAssetURL(fileId: string | null, params?: Record<string, string | number>) {
  if (!fileId) return null;
  const base = `${DIRECTUS_URL}/assets/${fileId}`;
  if (!params) return base;
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return `${base}?${query}`;
}

// ── Queries ──

export async function getPublishedRecipes() {
  return directus.request(
    readItems("recipes", {
      filter: { status: { _eq: "published" } },
      sort: ["-date_created"],
      fields: ["id", "title", "slug", "description", "image", "prep_time", "difficulty", "servings", "collection_label"],
    })
  );
}

export async function getRecipeBySlug(slug: string) {
  const recipes = await directus.request(
    readItems("recipes", {
      filter: {
        slug: { _eq: slug },
        status: { _eq: "published" },
      },
      limit: 1,
      fields: ["*"],
    })
  );
  return recipes[0] || null;
}
