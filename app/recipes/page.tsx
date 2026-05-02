import Link from "next/link";
import "./recipes.css";

export default function Recipes() {
    return (
        <div className="page">
            <header className="page-header">
                <p className="page-header__label">Explora las preparaciones</p>
                <h1 className="page-header__title">Recetas</h1>
            </header>

            {/* ── Filtros ── */}
            <div className="recipes-filters">
                <div className="recipes-filter-group">
                    <span className="recipes-filter-label">Tiempo de Preparación</span>
                    <div className="recipes-filter-pills">
                        <button className="recipes-pill">Menos de 15m</button>
                        <button className="recipes-pill recipes-pill--active">30 Minutos</button>
                        <button className="recipes-pill">60m +</button>
                    </div>
                </div>
                <div className="recipes-filter-group">
                    <span className="recipes-filter-label">Perfil de Sabor</span>
                    <div className="recipes-filter-pills">
                        <button className="recipes-pill">Dulce</button>
                        <button className="recipes-pill">Salado</button>
                        <button className="recipes-pill recipes-pill--accent">Botánico</button>
                    </div>
                </div>
                <button className="recipes-more-filters">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="4" y1="12" x2="14" y2="12" />
                        <line x1="4" y1="18" x2="10" y2="18" />
                    </svg>
                    Más Filtros
                </button>
            </div>
            {/* ── Grid editorial ── */}
            <div className="recipes-editorial-grid">
                {/* Bloque principal — card featured + imagen hero (sin separación entre ellos) */}
                <div className="recipes-primary-block">
                    <Link href="/recipes/testing-recipe" className="recipe-featured-card">
                        <div className="recipe-featured-card__tags">
                            <span className="recipe-tag">Salado</span>
                            <span className="recipe-tag recipe-tag--time">15 mins</span>
                        </div>
                        <h2 className="recipe-featured-card__title">Ensalada Verde con Aliño Cítrico</h2>
                        <p className="recipe-featured-card__desc">
                            La esencia del verano en un plato. Burrata fresca de la quesería local con tomates reliquia curados en sal y aceite de albahaca prensado en frío.
                        </p>
                        <div className="recipe-featured-card__footer">
                            <span className="recipe-skill-label">Sin esfuerzo</span>
                            <button className="recipe-save-btn" aria-label="Guardar receta">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                            </button>
                        </div>
                    </Link>
                    <div className="recipes-hero-image"> {/* Aquí le falta función de link */}
                        <div className="recipes-hero-image__placeholder">🥗</div>
                    </div>
                </div>
                {/* Columna derecha — card secundaria */}
                <Link href="/recipes/galette-frutos-rojos" className="recipe-side-card">
                    <div className="recipe-side-card__image">
                        <div className="recipe-side-card__image-placeholder">🫐</div>
                        <button className="recipe-wishlist-btn" aria-label="Agregar a favoritos">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </button>
                    </div>
                    <div className="recipe-side-card__body">
                        <div className="recipe-side-card__tags">
                            <span className="recipe-tag">Dulce</span>
                            <span className="recipe-tag recipe-tag--time recipe-tag--dot">45 mins</span>
                        </div>
                        <h3 className="recipe-side-card__title">Galette de Frutos Rojos</h3>
                        <p className="recipe-side-card__desc">
                            Masa hojaldrada que abraza una mezcla aromática y ácida de frutos del bosque…
                        </p>
                        <div className="recipe-side-card__footer">
                            <span className="recipe-skill-label">Habilidad moderada</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

{/*
    Falta añadir la conexión al backend.
    Falta corregir las imagenes del block grande para que funja como link.
    Resolver filtros con back.
*/}