"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "../../../AuthContext";
import LoginGate from "../../../LoginGate";
import AdminShell from "../../../AdminShell";
import RecipeEditor, { parseBodyToStructured, type RecipeData } from "../../../RecipeEditor";
import "../../new/editor.css";

const PB_URL = "/api/pb";

function EditLoader({ id }: { id: string }) {
  const { token } = useAuth();
  const [data, setData] = useState<RecipeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${PB_URL}/api/collections/recipes/records/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Receta no encontrada");
        const recipe = await res.json();

        const { ingredients, steps, pairings } = parseBodyToStructured(recipe.body || "");

        setData({
          id: recipe.id,
          title: recipe.title || "",
          description: recipe.description || "",
          collectionLabel: recipe.collection_label || "",
          prepTime: recipe.prep_time ? String(recipe.prep_time) : "",
          difficulty: recipe.difficulty || "effortless",
          servings: recipe.servings || "",
          flavor: recipe.flavor || "",
          imageId: recipe.id,
          imageFile: recipe.image || null,
          ingredients,
          steps,
          pairings,
        });
      } catch {
        setError("No se pudo cargar la receta");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, id]);

  if (loading) {
    return <div style={{ padding: "4rem", textAlign: "center", opacity: 0.4 }}>Cargando receta…</div>;
  }

  if (error || !data) {
    return <div style={{ padding: "4rem", textAlign: "center", color: "var(--accent)" }}>{error}</div>;
  }

  return <RecipeEditor mode="edit" initialData={data} />;
}

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <LoginGate>
      <AdminShell>
        <EditLoader id={id} />
      </AdminShell>
    </LoginGate>
  );
}
