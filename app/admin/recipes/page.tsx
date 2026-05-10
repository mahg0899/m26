"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../AuthContext";
import LoginGate from "../LoginGate";
import AdminShell from "../AdminShell";
import { useCategories } from "../useCategories";
import "./admin-recipes.css";

const PB_URL = "/api/pb";

interface RecipeItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  description: string | null;
  prep_time: number | null;
  difficulty: string | null;
  created: string;
  updated: string;
  image: string | null; // filename
}

const DIFFICULTY_LABELS: Record<string, string> = {
  effortless: "Sin esfuerzo",
  easy: "Fácil",
  medium: "Medio",
  advanced: "Avanzado",
};

const STATUS_LABELS: Record<string, string> = {
  published: "Publicada",
  draft: "Borrador",
  archived: "Archivada",
};


function RecipeList() {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [featuredCol, setFeaturedCol] = useState("");
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // Categorías desde PocketBase (colección `categories` con fallback a recetas)
  const collectionOptions = useCategories(token);

  const fetchRecipes = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${PB_URL}/api/collections/recipes/records?sort=-updated`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401 || res.status === 403) {
        // Token expired — force re-login
        sessionStorage.removeItem("m26:admin:token");
        window.location.reload();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.items || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Load featured collection setting
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(
          `${PB_URL}/api/collections/settings/records?perPage=1`,
          { headers: { Authorization: `Bearer ${token}` } }   // ← auth requerida
        );
        if (res.ok) {
          const data = await res.json();
          const rec = data.items?.[0];
          if (rec) {
            setFeaturedCol(rec.featured_collection || "");
            setSettingsId(rec.id);
          }
        }
      } catch { /* ignore */ }
    })();
  }, [token]);  // depende de token, no solo del mount

  const [featuredSaving, setFeaturedSaving] = useState<"idle"|"saving"|"saved"|"error">("idle");

  const handleFeaturedChange = async (value: string) => {
    setFeaturedCol(value);
    if (!token || !settingsId) {
      console.warn("[featured] settingsId no disponible aún", { token: !!token, settingsId });
      return;
    }
    setFeaturedSaving("saving");
    try {
      const res = await fetch(`${PB_URL}/api/collections/settings/records/${settingsId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ featured_collection: value }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("[featured] Error al guardar:", err);
        setFeaturedSaving("error");
      } else {
        setFeaturedSaving("saved");
      }
    } catch (e) {
      console.error("[featured] Excepción:", e);
      setFeaturedSaving("error");
    } finally {
      setTimeout(() => setFeaturedSaving("idle"), 2000);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      await fetch(`${PB_URL}/api/collections/recipes/records/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Error al eliminar la receta");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusToggle = async (recipe: RecipeItem) => {
    const newStatus = recipe.status === "published" ? "draft" : "published";
    try {
      await fetch(`${PB_URL}/api/collections/recipes/records/${recipe.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipe.id ? { ...r, status: newStatus } : r))
      );
    } catch {
      alert("Error al cambiar estado");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="admin-recipes">
      {/* ── Header ── */}
      <header className="admin-recipes__header">
        <div>
          <h1 className="admin-recipes__title">Recetas</h1>
          <p className="admin-recipes__count">
            {recipes.length} {recipes.length === 1 ? "receta" : "recetas"}
          </p>
        </div>
        <div className="admin-recipes__header-actions">
          <div className="admin-recipes__featured">
            <label className="admin-recipes__featured-label">Colección en Home:</label>
            <select
              className="admin-recipes__featured-select"
              value={featuredCol}
              onChange={(e) => handleFeaturedChange(e.target.value)}
              disabled={featuredSaving === "saving"}
            >
              <option value="">Ninguna</option>
              {collectionOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {featuredSaving === "saving" && <span className="admin-recipes__featured-status">Guardando…</span>}
            {featuredSaving === "saved"  && <span className="admin-recipes__featured-status admin-recipes__featured-status--ok">✓</span>}
            {featuredSaving === "error"  && <span className="admin-recipes__featured-status admin-recipes__featured-status--err">✗ Error</span>}
          </div>
          <Link href="/admin/recipes/new" className="admin-recipes__new-btn">
            + Nueva Receta
          </Link>
        </div>
      </header>

      {/* ── List ── */}
      {loading ? (
        <div className="admin-recipes__loading">Cargando…</div>
      ) : recipes.length === 0 ? (
        <div className="admin-recipes__empty">
          <p>No hay recetas aún</p>
          <Link href="/admin/recipes/new">Crear la primera receta</Link>
        </div>
      ) : (
        <div className="admin-recipes__list">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`admin-recipe-card ${recipe.status !== "published" ? "admin-recipe-card--draft" : ""}`}
            >
              {/* Thumbnail */}
              <div className="admin-recipe-card__thumb">
                {recipe.image ? (
                  <img
                    src={`${PB_URL}/api/files/recipes/${recipe.id}/${recipe.image}?thumb=120x120`}
                    alt={recipe.title}
                  />
                ) : (
                  <div className="admin-recipe-card__thumb-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="20" height="20">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="admin-recipe-card__info">
                <div className="admin-recipe-card__top">
                  <h3 className="admin-recipe-card__title">{recipe.title}</h3>
                  <span className={`admin-recipe-card__status admin-recipe-card__status--${recipe.status}`}>
                    {STATUS_LABELS[recipe.status] || recipe.status}
                  </span>
                </div>
                {recipe.description && (
                  <p className="admin-recipe-card__desc">{recipe.description}</p>
                )}
                <div className="admin-recipe-card__meta">
                  <span>{formatDate(recipe.updated || recipe.created)}</span>
                  {recipe.prep_time && <span>⏱ {recipe.prep_time} min</span>}
                  {recipe.difficulty && <span>{DIFFICULTY_LABELS[recipe.difficulty]}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="admin-recipe-card__actions">
                <Link
                  href={`/recipes/${recipe.slug}`}
                  className="admin-recipe-card__action"
                  title="Ver receta"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Link>
                <Link
                  href={`/admin/recipes/${recipe.id}/edit`}
                  className="admin-recipe-card__action"
                  title="Editar receta"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </Link>
                <button
                  className="admin-recipe-card__action"
                  title={recipe.status === "published" ? "Pasar a borrador" : "Publicar"}
                  onClick={() => handleStatusToggle(recipe)}
                >
                  {recipe.status === "published" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <button
                  className="admin-recipe-card__action admin-recipe-card__action--danger"
                  title="Eliminar"
                  onClick={() => handleDelete(recipe.id, recipe.title)}
                  disabled={deleting === recipe.id}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminRecipesPage() {
  return (
    <LoginGate>
      <AdminShell>
        <RecipeList />
      </AdminShell>
    </LoginGate>
  );
}
