"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8090";

// ── Interfaces ──
export interface IngredientItem {
  text: string;
}

export interface StepItem {
  title: string;
  description: string;
  duration: string;
}

export interface PairingItem {
  text: string;
}

export interface RecipeData {
  id?: string;
  title: string;
  description: string;
  collectionLabel: string;
  prepTime: string;
  difficulty: string;
  servings: string;
  flavor: string;
  imageId: string | null;
  imageFile: string | null;
  ingredients: IngredientItem[];
  steps: StepItem[];
  pairings: PairingItem[];
}

// ── Parse HTML body back into structured data ──
export function parseBodyToStructured(html: string): {
  ingredients: IngredientItem[];
  steps: StepItem[];
  pairings: PairingItem[];
} {
  const ingredients: IngredientItem[] = [];
  const steps: StepItem[] = [];
  const pairings: PairingItem[] = [];

  if (typeof window === "undefined") {
    return { ingredients: [{ text: "" }], steps: [{ title: "", description: "", duration: "" }], pairings: [{ text: "" }] };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const children = Array.from(doc.body.children);

  let i = 0;
  while (i < children.length) {
    const el = children[i];

    if (el.tagName === "H2") {
      const heading = el.textContent?.trim().toLowerCase() || "";
      const next = children[i + 1];

      if (next?.tagName === "UL") {
        const items = Array.from(next.querySelectorAll("li")).map(
          (li) => ({ text: li.textContent?.trim() || "" })
        );

        if (heading.includes("maridaje") || heading.includes("pairing")) {
          pairings.push(...items);
        } else {
          ingredients.push(...items);
        }
        i += 2;
        continue;
      }

      if (next?.tagName === "OL") {
        Array.from(next.querySelectorAll("li")).forEach((li) => {
          const strong = li.querySelector("strong");
          const title = strong?.textContent?.trim() || "";
          let body = li.innerHTML;
          if (strong) {
            body = body.replace(/<strong>.*?<\/strong>/, "").replace(/^\s*[—–\-]\s*/, "").trim();
          }

          // Extract duration
          const durationMatch = body.match(/\[(\d+\s*(?:h(?:oras?|rs?)?|min(?:utos?)?)(?:\s*\d+\s*(?:min(?:utos?)?))?)\]/i);
          const duration = durationMatch ? durationMatch[1] : "";
          if (durationMatch) {
            body = body.replace(durationMatch[0], "").trim();
          }

          // Strip remaining HTML tags for plain text
          const tmp = document.createElement("div");
          tmp.innerHTML = body;
          const description = tmp.textContent?.trim() || "";

          steps.push({ title, description, duration });
        });
        i += 2;
        continue;
      }
    }
    i++;
  }

  return {
    ingredients: ingredients.length > 0 ? ingredients : [{ text: "" }],
    steps: steps.length > 0 ? steps : [{ title: "", description: "", duration: "" }],
    pairings: pairings.length > 0 ? pairings : [{ text: "" }],
  };
}

// ── Build HTML body from structured data ──
function buildBody(
  ingredients: IngredientItem[],
  steps: StepItem[],
  pairings: PairingItem[]
): string {
  let html = "";

  if (ingredients.some((ing) => ing.text.trim())) {
    html += "<h2>Ingredientes</h2>\n<ul>\n";
    ingredients.forEach((ing) => {
      if (ing.text.trim()) html += `<li>${ing.text.trim()}</li>\n`;
    });
    html += "</ul>\n";
  }

  if (steps.some((s) => s.title.trim() || s.description.trim())) {
    html += "<h2>El Procedimiento</h2>\n<ol>\n";
    steps.forEach((step) => {
      if (step.title.trim() || step.description.trim()) {
        let li = "";
        if (step.title.trim()) li += `<strong>${step.title.trim()}</strong>`;
        if (step.description.trim()) li += ` — ${step.description.trim()}`;
        if (step.duration.trim()) li += ` [${step.duration.trim()}]`;
        html += `<li>${li}</li>\n`;
      }
    });
    html += "</ol>\n";
  }

  if (pairings.some((p) => p.text.trim())) {
    html += "<h2>Maridaje</h2>\n<ul>\n";
    pairings.forEach((p) => {
      if (p.text.trim()) html += `<li>${p.text.trim()}</li>\n`;
    });
    html += "</ul>\n";
  }

  return html;
}

// ── Shared Editor Component ──
interface RecipeEditorProps {
  mode: "create" | "edit";
  initialData?: RecipeData;
}

export default function RecipeEditor({ mode, initialData }: RecipeEditorProps) {
  const { token } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [collectionLabel, setCollectionLabel] = useState(initialData?.collectionLabel || "");
  const [prepTime, setPrepTime] = useState(initialData?.prepTime || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "effortless");
  const [servings, setServings] = useState(initialData?.servings || "");
  const [flavor, setFlavor] = useState(initialData?.flavor || "");
  const [existingRecordId, setExistingRecordId] = useState<string | null>(initialData?.imageId || null);
  const [existingImageFilename, setExistingImageFilename] = useState<string | null>(initialData?.imageFile || null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageId && initialData?.imageFile
      ? `${PB_URL}/api/files/recipes/${initialData.imageId}/${initialData.imageFile}`
      : null
  );

  const [ingredients, setIngredients] = useState<IngredientItem[]>(
    initialData?.ingredients || [{ text: "" }]
  );
  const [steps, setSteps] = useState<StepItem[]>(
    initialData?.steps || [{ title: "", description: "", duration: "" }]
  );
  const [pairings, setPairings] = useState<PairingItem[]>(
    initialData?.pairings || [{ text: "" }]
  );

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset save status after feedback
  useEffect(() => {
    if (saveStatus === "saved" && mode === "edit") {
      const t = setTimeout(() => setSaveStatus("idle"), 2000);
      return () => clearTimeout(t);
    }
  }, [saveStatus, mode]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Dynamic list helpers
  const updateIngredient = (i: number, text: string) =>
    setIngredients((prev) => prev.map((item, idx) => (idx === i ? { text } : item)));
  const addIngredient = () => setIngredients((prev) => [...prev, { text: "" }]);
  const removeIngredient = (i: number) =>
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));

  const updateStep = (i: number, field: keyof StepItem, value: string) =>
    setSteps((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  const addStep = () =>
    setSteps((prev) => [...prev, { title: "", description: "", duration: "" }]);
  const removeStep = (i: number) =>
    setSteps((prev) => prev.filter((_, idx) => idx !== i));

  const updatePairing = (i: number, text: string) =>
    setPairings((prev) => prev.map((item, idx) => (idx === i ? { text } : item)));
  const addPairing = () => setPairings((prev) => [...prev, { text: "" }]);

  const handleSave = useCallback(async () => {
    if (!token || !title.trim()) return;
    setSaving(true);
    setSaveStatus("idle");
    setSaveError(null);

    try {
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const body = buildBody(ingredients, steps, pairings);

      // PocketBase: use FormData for everything (includes file upload)
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("slug", slug);
      formData.append("description", description.trim() || "");
      formData.append("collection_label", collectionLabel.trim() || "");
      formData.append("prep_time", prepTime ? String(parseInt(prepTime)) : "0");
      formData.append("difficulty", difficulty);
      formData.append("servings", servings.trim() || "");
      // PocketBase select fields rechazan cadena vacía — solo enviar si hay valor
      if (flavor) formData.append("flavor", flavor);
      formData.append("body", body);
      if (mode === "create") formData.append("status", "published");

      // Attach image file if a new one was selected
      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      const url = mode === "edit"
        ? `${PB_URL}/api/collections/recipes/records/${initialData?.id}`
        : `${PB_URL}/api/collections/recipes/records`;

      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        // PocketBase v0.23+ superuser tokens requieren prefijo Bearer
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        // Leer el error real de PocketBase para saber qué campo falló
        let detail = `Status ${res.status}`;
        try {
          const errJson = await res.json();
          // PocketBase devuelve: { message, data: { field: { code, message } } }
          const fields = errJson.data ? Object.entries(errJson.data)
            .map(([k, v]: [string, any]) => `${k}: ${v?.message ?? v?.code}`)
            .join(", ") : null;
          detail = fields ? `${errJson.message} (${fields})` : (errJson.message ?? detail);
        } catch { /* res no era JSON */ }
        throw new Error(detail);
      }

      const result = await res.json();
      setSaveStatus("saved");

      // Update image state after save
      if (result.image) {
        setExistingRecordId(result.id);
        setExistingImageFilename(result.image);
        setNewImageFile(null);
        setImagePreview(`${PB_URL}/api/files/recipes/${result.id}/${result.image}`);
      }

      if (mode === "create") {
        setTimeout(() => router.push(`/recipes/${result.slug}`), 800);
      }
    } catch (err) {
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }, [token, title, description, collectionLabel, prepTime, difficulty, servings, flavor, newImageFile, ingredients, steps, pairings, mode, initialData?.id, router]);

  const saveLabel = saving
    ? "Guardando…"
    : saveStatus === "saved"
      ? "✓ Guardado"
      : mode === "edit"
        ? "Actualizar"
        : "Guardar Cambios";

  return (
    <div className="editor">
      <header className="editor__topbar">
        <span className="editor__topbar-label">
          {mode === "edit" ? "Editando Receta" : "Nueva Receta"}
        </span>
        <div className="editor__topbar-actions">
          {mode === "edit" && (
            <button
              className="editor__back-btn"
              onClick={() => router.push("/admin/recipes")}
            >
              ← Volver
            </button>
          )}
          <button className="editor__save-btn" onClick={handleSave} disabled={saving || !title.trim()}>
            {saveLabel}
          </button>
        </div>
      </header>

      <div className="editor__grid">
        <div className="editor__left">
          <div className="editor__meta-field">
            <label className="editor__field-label">Colección</label>
            <select value={collectionLabel} onChange={(e) => setCollectionLabel(e.target.value)} className="editor__select">
              <option value="">Sin colección</option>
              <option value="Summer Collection 2024">Summer Collection 2024</option>
              <option value="Autumn Harvest">Autumn Harvest</option>
              <option value="Winter Comfort">Winter Comfort</option>
              <option value="Spring Fresh">Spring Fresh</option>
              <option value="Testing Collection">Testing Collection</option>
            </select>
          </div>
          <input className="editor__title-input" placeholder="Título de la Receta..." value={title} onChange={(e) => setTitle(e.target.value)} />
          <label className="editor__field-label">Descripción de la receta</label>
          <textarea className="editor__description" placeholder="Escribe el origen de este aroma..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <div className="editor__meta-row">
            <div className="editor__meta-field">
              <label className="editor__field-label">Tiempo Prep (min)</label>
              <input type="number" placeholder="15" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
            </div>
            <div className="editor__meta-field">
              <label className="editor__field-label">Dificultad</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="editor__select">
                <option value="effortless">Sin esfuerzo</option>
                <option value="easy">Fácil</option>
                <option value="medium">Medio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
            <div className="editor__meta-field">
              <label className="editor__field-label">Porciones</label>
              <input placeholder="2 Porciones" value={servings} onChange={(e) => setServings(e.target.value)} />
            </div>
          </div>

          <div className="editor__flavor-row">
            <span className="editor__field-label">Perfil de Sabor</span>
            <div className="editor__flavor-checks">
              {(["dulce", "salado", "mixto"] as const).map((v) => (
                <label key={v} className={`editor__flavor-option${flavor === v ? " editor__flavor-option--active" : ""}`}>
                  <input
                    type="checkbox"
                    checked={flavor === v}
                    onChange={() => setFlavor(flavor === v ? "" : v)}
                  />
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </label>
              ))}
            </div>
          </div>

        </div>

        <div className="editor__right">
          <div className={`editor__image-upload ${imagePreview ? "editor__image-upload--has-image" : ""}`} onClick={() => !imagePreview && fileInputRef.current?.click()}>
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" />
                <div className="editor__image-overlay">
                  <button
                    type="button"
                    className="editor__image-action"
                    title="Cambiar imagen"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="editor__image-action editor__image-action--danger"
                    title="Eliminar imagen"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setNewImageFile(null);
                      setExistingImageFilename(null);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div className="editor__image-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="40" height="40">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Imagen de la Receta</span>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} hidden />
          </div>
        </div>
      </div>

      <div className="editor__content-grid">
        <div className="editor__content-left">
          <section className="editor__section">
            <h2 className="editor__section-title">
              Ingredientes
              <button className="editor__add-btn" onClick={addIngredient} title="Añadir ingrediente">+</button>
            </h2>
            <ul className="editor__ingredient-list">
              {ingredients.map((ing, i) => (
                <li key={i} className="editor__ingredient-item">
                  <span className="editor__ingredient-bullet">•</span>
                  <input placeholder="Añadir ingrediente..." value={ing.text} onChange={(e) => updateIngredient(i, e.target.value)} />
                  {ingredients.length > 1 && (
                    <button className="editor__remove-btn" onClick={() => removeIngredient(i)}>×</button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="editor__content-right">
          <div className="editor__steps-header">
            <h2 className="editor__section-title editor__section-title--large">Procedimiento</h2>
            <span className="editor__steps-hint">Descripción de pasos</span>
          </div>

          {steps.map((step, i) => (
            <div key={i} className="editor__step">
              <div className="editor__step-number">{String(i + 1).padStart(2, "0")}</div>
              <div className="editor__step-fields">
                <input className="editor__step-title" placeholder={`Título del paso ${i + 1}...`} value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} />
                <textarea className="editor__step-desc" placeholder="Describe el proceso..." value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} rows={2} />
                <div className="editor__step-meta">
                  <div className="editor__step-duration">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <input placeholder="15 min" value={step.duration} onChange={(e) => updateStep(i, "duration", e.target.value)} />
                  </div>
                  {steps.length > 1 && (
                    <button className="editor__remove-btn" onClick={() => removeStep(i)}>Eliminar</button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button className="editor__add-step" onClick={addStep}>+ Añadir paso</button>
        </div>
      </div>

      {saveStatus === "error" && (
        <div className="editor__error">
          <strong>Error al guardar.</strong>
          {saveError && <span> {saveError}</span>}
        </div>
      )}
    </div>
  );
}
