import type { Metadata } from "next";
import NotesCompendium from "./NotesCompendium";
import "./notes.css";

export const metadata: Metadata = {
    title: "Mis Notas",
    description: "Tus apuntes y observaciones privadas por receta, reunidos en un solo lugar.",
    openGraph: { title: "Mis Notas | Donum", type: "website" },
};

export default function NotesPage() {
    return (
        <div className="page">
            <header className="page-header">
                <p className="page-header__label">Compendio personal</p>
                <h1 className="page-header__title">Mis Notas</h1>
                <p className="page-header__desc">
                    Todas tus observaciones y apuntes privados, reunidos en un solo lugar.
                </p>
            </header>
            <NotesCompendium />
        </div>
    );
}