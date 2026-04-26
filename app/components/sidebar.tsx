"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

/* ─── SVG Icon Components ─── */
function IconRecetas() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 11h.01" />
      <path d="M11 15h.01" />
      <path d="M16 16h.01" />
      <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
      <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
    </svg>
  );
}

function IconNotas() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
      <path d="M15 3v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function IconAjustes() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconGuardados() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function IconBugReport() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function IconLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

/* ─── Nav Items ─── */
const navItems = [
  { href: "/recipes", label: "Recetas", Icon: IconRecetas },
  { href: "/notes", label: "Notas", Icon: IconNotas },
  { href: "/settings", label: "Ajustes", Icon: IconAjustes },
  { href: "/saved", label: "Guardados", Icon: IconGuardados },
];

const secondaryItems = [
  { href: "/bug-report", label: "Informar de un error", Icon: IconBugReport },
];

/* ─── Sidebar Component ─── */
export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setDesktopExpanded(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setDesktopExpanded(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDesktopExpanded(false);
  }, []);

  const sidebarClasses = [
    "sidebar",
    mobileOpen ? "sidebar--mobile-open" : "",
    desktopExpanded ? "sidebar--expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <button
        className="sidebar-toggle"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        id="sidebar-hamburger"
      >
        <div className={`hamburger ${mobileOpen ? "active" : ""}`}>
          <span />
          <span />
          <span />
        </div>
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={sidebarClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="sidebar__header">
          <Link href="/" className="sidebar__logo">
            <span className="sidebar__logo-icon">
              <IconLogo />
            </span>
            <span className="sidebar__logo-text">M26</span>
          </Link>
          <Link href="/admin/recipes" className="sidebar__admin-trigger" title="">
            <span />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <ul>
            {navItems.map(({ href, label, Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
                    title={label}
                  >
                    <span className="sidebar__link-icon">
                      <Icon />
                    </span>
                    <span className="sidebar__link-text">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          {secondaryItems.map(({ href, label, Icon }) => (
            <Link
              key={label}
              href={href}
              className="sidebar__footer-link"
              title={label}
            >
              <span className="sidebar__link-icon">
                <Icon />
              </span>
              <span className="sidebar__link-text">{label}</span>
            </Link>
          ))}
          <div className="sidebar__footer-meta">
            <span className="sidebar__status-dot" />
            <span className="sidebar__link-text sidebar__version">v0.3.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
