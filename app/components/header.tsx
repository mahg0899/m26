import Link from "next/link";

export default function Header() {
    return (
        <header>
            <div className="logo">
                <Link href="/">Project M26</Link>
            </div>
            <ul>
                <li><Link href="/recipes">Recetas</Link></li>
                <li><Link href="/notes">Notas</Link></li>
                <li><Link href="/settings">Ajustes</Link></li>
                <li><Link href="/archive">Guardados</Link></li>
            </ul>
            <ul>
                <li><Link href="/">Informar de un error</Link></li>
            </ul>
        </header>
    );
}