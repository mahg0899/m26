"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import type { ReactNode } from "react";
import "./admin-shell.css";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const nav = [
    { href: "/admin/recipes", label: "Recetas" },
    { href: "/admin/categories", label: "Categorías" },
  ];

  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <div className="admin-nav__links">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`admin-nav__link ${pathname.startsWith(href) ? "admin-nav__link--active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <button className="admin-nav__logout" onClick={logout} title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Salir
        </button>
      </nav>
      <main className="admin-shell__content">
        {children}
      </main>
    </div>
  );
}
