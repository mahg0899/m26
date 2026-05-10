import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sobre Donum",
    description: "Conoce el proyecto Donum, una app para guardar y disfrutar tus recetas favoritas.",
    openGraph: { title: "Sobre Donum", type: "website" },
};

export default function About() {
    return (
        <div className="page">
            <header className="page-header">
                <p className="page-header__label">Conoce más</p>
                <h1 className="page-header__title">Sobre M26</h1>
            </header>
            <div className="page-content">
                <p>En construcción...</p>
            </div>
        </div>
    );
}