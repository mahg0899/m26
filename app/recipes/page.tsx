import Link from "next/link";
import Recipe from "./[slug]/page";

export default function Recipes() {
    return (
        <div className="flex flex-col gap-2 mx-auto w-9/10 pt-15 md:pt-10">
            <h1>Recetas</h1>
            <p>En construcción...</p>
            <Link href="/recipes/test">Test</Link>
        </div>
    );
}
