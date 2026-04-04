"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/recipes", label: "Recetas" },
  { href: "/notes", label: "Notas" },
  { href: "/settings", label: "Ajustes" },
  { href: "/archive", label: "Guardados" },
];

const secondaryItems = [
  { href: "/", label: "Informar de un error" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
      >
        <div className={`hamburger ${isOpen ? "active" : ""}`}>
          <span />
          <span />
          <span />
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            Project M26
          </Link>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar-link ${pathname === item.href ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <ul className="flex">
            {secondaryItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="sidebar-link_footer">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <span className="sidebar-link_footer">v0.1.0</span>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
}
