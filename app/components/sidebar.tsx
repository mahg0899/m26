"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";

/* ─── SVG Icon Components ─── */
function IconRecetas() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
      <path d="M6 17h12" />
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

function IconGuardados() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

function IconInicio() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
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
  { href: "/", label: "Inicio", Icon: IconInicio },
  { href: "/recipes", label: "Recetas", Icon: IconRecetas },
  { href: "/notes", label: "Notas", Icon: IconNotas },
  { href: "/saved", label: "Guardados", Icon: IconGuardados },
];

const secondaryItems = [
  { href: "https://github.com/mahg0899/m26/issues/new", label: "Informar de un error", Icon: IconBugReport },
];

/* ─── useScrollDirection hook (mobile bottom nav) ─── */
function useScrollDirection(threshold = 8) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const current = window.scrollY;
        const delta = current - lastScrollY.current;
        if (Math.abs(delta) > threshold) {
          setHidden(delta > 0 && current > 60);
          lastScrollY.current = current;
        }
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return hidden;
}

/* ─── Sidebar Component ─── */
export default function Sidebar() {
  const pathname = usePathname();
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const bottomNavHidden = useScrollDirection();

  // Escape key — collapses desktop sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDesktopExpanded(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleMouseEnter = useCallback(() => setDesktopExpanded(true), []);
  const handleMouseLeave = useCallback(() => setDesktopExpanded(false), []);

  const sidebarClasses = [
    "sidebar",
    desktopExpanded ? "sidebar--expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Exact match for "/" to avoid marking every route active
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ── Desktop sidebar ── */}
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

          {/* Hidden admin access */}
          <Link href="/admin/recipes" className="sidebar__admin-trigger" title="">
            <span />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <ul>
            {navItems.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`sidebar__link ${isActive(href) ? "sidebar__link--active" : ""}`}
                  title={label}
                >
                  <span className="sidebar__link-icon">
                    <Icon />
                  </span>
                  <span className="sidebar__link-text">{label}</span>
                </Link>
              </li>
            ))}
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
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sidebar__link-icon">
                <Icon />
              </span>
              <span className="sidebar__link-text">{label}</span>
            </Link>
          ))}
          <div className="sidebar__footer-meta">
            <span className="sidebar__status-dot" />
            <span className="sidebar__link-text sidebar__version">v0.6.2</span>
          </div>
        </div>
      </aside>

      {/* ── Mobile / Tablet bottom nav bar ── */}
      <nav
        className={`bottom-nav${bottomNavHidden ? " bottom-nav--hidden" : ""}`}
        aria-label="Navegación principal"
      >
        {navItems.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`bottom-nav__item${isActive(href) ? " bottom-nav__item--active" : ""}`}
            aria-label={label}
          >
            <span className="bottom-nav__icon">
              <Icon />
            </span>
            <span className="bottom-nav__label">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
