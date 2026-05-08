import SavedCollection from "./SavedCollection";

export const metadata = {
  title: "Guardados — M26",
  description: "Tus recetas guardadas, siempre a mano.",
};

export default function SavedPage() {
  return (
    <div className="page">
      <header className="page-header">
        <p className="page-header__label">Tu colección</p>
        <h1 className="page-header__title">Guardados</h1>
        <p className="page-header__desc">
          Las recetas que marcaste para volver a encontrarlas fácilmente.
        </p>
      </header>
      <SavedCollection />
    </div>
  );
}