import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reportar un error",
    description: "Ayúdanos a mejorar Donum reportando cualquier error que encuentres.",
};

export default function BugReport() {

    return (
        <div className="page">
            <header className="page-header">
                <p className="page-header__label">Ayúdanos a mejorar</p>
                <h1 className="page-header__title">Reportar un error</h1>
            </header>
            <div className="page-content">
                <p>Si encuentras un error, por favor infórmanos aquí. Describe el problema y adjunta capturas si es necesario.</p>
                <p>Sección en desarrollo.</p>
            </div>
        </div>
    );
}