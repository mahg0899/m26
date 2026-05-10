"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../AuthContext";
import LoginGate from "../LoginGate";
import AdminShell from "../AdminShell";
import "./admin-categories.css";

const PB_URL = "/api/pb";

interface StoredCategory {
  id: string;
  name: string;
}

interface CategoryInfo {
  id: string | null;     // null = viene solo de recetas (no está en la colección categories)
  name: string;
  count: number;         // recetas que la usan
  stored: boolean;       // true = existe en la colección categories de PB
}

function CategoryManager() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [renamingFrom, setRenamingFrom] = useState<string | null>(null);
  const [renameTo, setRenameTo] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [error, setError] = useState("");

  /**
   * Carga categorías desde dos fuentes y las combina:
   * 1. collection_label únicos en recetas (categorías "en uso")
   * 2. Registros en la colección `categories` de PocketBase (incluye nuevas sin recetas aún)
   */
  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fuente 1: collection_labels desde recetas (id requerido para que PocketBase devuelva resultados)
      const recipesRes = await fetch(
        `${PB_URL}/api/collections/recipes/records?fields=id,collection_label&perPage=500`,
        { headers }
      );
      const recipesData = recipesRes.ok ? await recipesRes.json() : { items: [] };
      const labelCount = new Map<string, number>();
      (recipesData.items || []).forEach(({ collection_label }: { collection_label: string | null }) => {
        if (collection_label) {
          labelCount.set(collection_label, (labelCount.get(collection_label) ?? 0) + 1);
        }
      });

      // Fuente 2: colección `categories` en PocketBase
      const catRes = await fetch(
        `${PB_URL}/api/collections/categories/records?sort=name&perPage=500`,
        { headers }
      );
      const storedCats: StoredCategory[] = catRes.ok
        ? ((await catRes.json()).items ?? [])
        : [];

      // Combinar: partir de las categorías guardadas en PB
      const merged = new Map<string, CategoryInfo>();
      storedCats.forEach((cat) => {
        merged.set(cat.name, {
          id: cat.id,
          name: cat.name,
          count: labelCount.get(cat.name) ?? 0,
          stored: true,
        });
      });
      // Añadir las que solo existen en recetas (no tienen registro propio)
      labelCount.forEach((count, name) => {
        if (!merged.has(name)) {
          merged.set(name, { id: null, name, count, stored: false });
        }
      });

      setCategories(
        Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  /** Guarda la nueva categoría en PocketBase */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || !token) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError("Ya existe una categoría con ese nombre.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${PB_URL}/api/collections/categories/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(
            "La colección 'categories' no existe en PocketBase. " +
            "Créala con un campo 'name' (Text) desde el panel de PocketBase."
          );
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Error ${res.status}`);
      }

      const created: StoredCategory = await res.json();
      setCategories((prev) =>
        [...prev, { id: created.id, name: created.name, count: 0, stored: true }]
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la categoría");
    } finally {
      setSaving(false);
    }
  };

  /** Elimina la categoría de PocketBase (no afecta las recetas que la usan) */
  const handleDelete = async (cat: CategoryInfo) => {
    if (!cat.stored || !cat.id) {
      setError("Esta categoría viene de recetas existentes. Renombra o elimínala editando las recetas.");
      return;
    }
    if (!confirm(`¿Eliminar "${cat.name}"? Las recetas que la usan no se modificarán.`)) return;
    try {
      await fetch(`${PB_URL}/api/collections/categories/records/${cat.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((prev) => prev.filter((c) => c.name !== cat.name));
    } catch {
      setError("Error al eliminar la categoría");
    }
  };

  /** Renombra: actualiza PocketBase + todas las recetas afectadas */
  const handleRename = async (cat: CategoryInfo) => {
    const newLabel = renameTo.trim();
    if (!newLabel || newLabel === cat.name || !token) return;
    setRenaming(true);
    setError("");
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Renombrar en la colección `categories` si existe ahí
      if (cat.stored && cat.id) {
        await fetch(`${PB_URL}/api/collections/categories/records/${cat.id}`, {
          method: "PATCH",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ name: newLabel }),
        });
      }

      // 2. Actualizar collection_label en todas las recetas afectadas
      if (cat.count > 0) {
        const encoded = encodeURIComponent(`collection_label='${cat.name}'`);
        const recipesRes = await fetch(
          `${PB_URL}/api/collections/recipes/records?filter=(${encoded})&fields=id&perPage=500`,
          { headers }
        );
        if (recipesRes.ok) {
          const data = await recipesRes.json();
          await Promise.all(
            (data.items || []).map((r: { id: string }) =>
              fetch(`${PB_URL}/api/collections/recipes/records/${r.id}`, {
                method: "PATCH",
                headers: { ...headers, "Content-Type": "application/json" },
                body: JSON.stringify({ collection_label: newLabel }),
              })
            )
          );
        }
      }

      setCategories((prev) =>
        prev
          .map((c) => c.name === cat.name ? { ...c, name: newLabel } : c)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setRenamingFrom(null);
      setRenameTo("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al renombrar");
    } finally {
      setRenaming(false);
    }
  };

  /** Sincroniza: registra en `categories` todas las que solo viven en recetas */
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSync = async () => {
    const unsynced = categories.filter((c) => !c.stored);
    if (unsynced.length === 0) {
      setSyncResult("Todo ya estaba sincronizado.");
      return;
    }
    if (!confirm(`¿Registrar ${unsynced.length} categoría(s) en PocketBase?\n\n${unsynced.map(c => `• ${c.name}`).join('\n')}`)) return;
    setSyncing(true);
    setSyncResult(null);
    setError("");
    let ok = 0;
    let fail = 0;
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    for (const cat of unsynced) {
      try {
        const res = await fetch(`${PB_URL}/api/collections/categories/records`, {
          method: "POST",
          headers,
          body: JSON.stringify({ name: cat.name }),
        });
        if (res.ok) {
          const created = await res.json();
          setCategories((prev) =>
            prev.map((c) => c.name === cat.name ? { ...c, id: created.id, stored: true } : c)
          );
          ok++;
        } else {
          fail++;
        }
      } catch { fail++; }
    }
    setSyncing(false);
    setSyncResult(
      fail === 0
        ? `✓ ${ok} categoría(s) sincronizadas correctamente.`
        : `${ok} sincronizadas, ${fail} con error.`
    );
  };

  return (
    <div className="cat-page">
      <header className="cat-page__header">
        <div>
          <h1 className="cat-page__title">Categorías</h1>
          <p className="cat-page__count">
            {categories.length} {categories.length === 1 ? "categoría" : "categorías"}
          </p>
        </div>
        {categories.some((c) => !c.stored) && (
          <button
            className="cat-sync-btn"
            onClick={handleSync}
            disabled={syncing}
            title="Registrar en PocketBase todas las categorías que vienen de recetas"
          >
            {syncing ? "Sincronizando…" : `↺ Sincronizar desde recetas (${categories.filter(c => !c.stored).length})`}
          </button>
        )}
      </header>
      {syncResult && (
        <p className={`cat-sync-result${syncResult.includes('error') ? ' cat-sync-result--error' : ''}`}>
          {syncResult}
        </p>
      )}

      {/* ── Nueva categoría ── */}
      <form className="cat-form" onSubmit={handleCreate}>
        <input
          className="cat-form__input"
          placeholder="Nombre de la nueva categoría…"
          value={newName}
          onChange={(e) => { setNewName(e.target.value); setError(""); }}
          disabled={saving}
          maxLength={80}
        />
        <button type="submit" className="cat-form__btn" disabled={saving || !newName.trim()}>
          {saving ? "Guardando…" : "+ Añadir"}
        </button>
      </form>
      {error && <p className="cat-form__error">{error}</p>}

      {/* ── Lista ── */}
      {loading ? (
        <div className="cat-loading">Cargando…</div>
      ) : categories.length === 0 ? (
        <div className="cat-empty">
          <p>No hay categorías todavía.</p>
          <p className="cat-empty__hint">Añade una arriba o asigna una colección a una receta.</p>
        </div>
      ) : (
        <ul className="cat-list">
          {categories.map((cat) => (
            <li key={cat.name} className="cat-item">
              {renamingFrom === cat.name ? (
                <div className="cat-item__rename">
                  <input
                    className="cat-item__rename-input"
                    value={renameTo}
                    onChange={(e) => setRenameTo(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(cat);
                      if (e.key === "Escape") { setRenamingFrom(null); setRenameTo(""); }
                    }}
                  />
                  <button
                    className="cat-item__rename-save"
                    onClick={() => handleRename(cat)}
                    disabled={renaming || !renameTo.trim() || renameTo.trim() === cat.name}
                  >
                    {renaming ? "…" : "Guardar"}
                  </button>
                  <button
                    className="cat-item__rename-cancel"
                    onClick={() => { setRenamingFrom(null); setRenameTo(""); }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <div className="cat-item__left">
                    <span className="cat-item__name">{cat.name}</span>
                    {cat.count > 0 ? (
                      <span className="cat-item__count">
                        {cat.count} {cat.count === 1 ? "receta" : "recetas"}
                      </span>
                    ) : (
                      <span className="cat-item__count cat-item__count--empty">Sin recetas</span>
                    )}
                    {!cat.stored && (
                      <span className="cat-item__badge">desde recetas</span>
                    )}
                  </div>
                  <div className="cat-item__actions">
                    <button
                      className="cat-item__edit"
                      onClick={() => { setRenamingFrom(cat.name); setRenameTo(cat.name); }}
                      title="Renombrar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {cat.stored && (
                      <button
                        className="cat-item__delete"
                        onClick={() => handleDelete(cat)}
                        title="Eliminar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <LoginGate>
      <AdminShell>
        <CategoryManager />
      </AdminShell>
    </LoginGate>
  );
}
