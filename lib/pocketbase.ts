// ── PocketBase client for M26 recipes ──

export interface Recipe {
  id: string;
  status: "draft" | "published" | "archived";
  created: string;
  updated: string;
  title: string;
  slug: string;
  description: string | null;
  collection_label: string | null;
  image: string | null; // filename stored in PocketBase
  prep_time: number | null;
  difficulty: "effortless" | "easy" | "medium" | "advanced" | null;
  servings: string | null;
  body: string | null;
}

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

// ── Asset URL builder ──

export function getAssetURL(
  recordId: string,
  filename: string | null,
  params?: Record<string, string | number>
) {
  if (!filename) return null;
  const base = `${PB_URL}/api/files/recipes/${recordId}/${filename}`;
  if (!params) return base;
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  return `${base}?${query}`;
}

// ── Queries ──

export async function getPublishedRecipes(): Promise<Recipe[]> {
  const res = await fetch(
    `${PB_URL}/api/collections/recipes/records?filter=(status='published')&sort=-updated`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const encoded = encodeURIComponent(slug);
  const res = await fetch(
    `${PB_URL}/api/collections/recipes/records?filter=(slug='${encoded}'%26%26status='published')&perPage=1`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0] || null;
}

// ── Settings ──

export async function getFeaturedCollection(): Promise<string | null> {
  const res = await fetch(
    `${PB_URL}/api/collections/settings/records?perPage=1`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0]?.featured_collection || null;
}
