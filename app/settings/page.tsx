import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ajustes",
    description: "Personaliza tus preferencias en Donum.",
};

export default function Settings() {
    return (
        <div className="page">
            <header className="page-header">
                <p className="page-header__label">Preferencias</p>
                <h1 className="page-header__title">Ajustes</h1>
            </header>
            <div className="page-content">
                <p>Próximamente...</p>
            </div>
        </div>
    );
}