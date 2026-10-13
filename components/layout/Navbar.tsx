"use client"; // needs state + browser APIs (menu open/closed, scroll tracking)

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import Button from "@/components/ui/Button";
import { navItems } from "@/data/navigation";
import { profile } from "@/data/profile";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [observedId, setObservedId] = useState("home");
  // Only the home page has the sections, so nothing is highlighted on sub-pages.
  const activeId = usePathname() === "/" ? observedId : "";
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Highlight the link of the section currently crossing the middle of the screen.
  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setObservedId(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // While the mobile menu is open, Escape closes it and returns focus to the button.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const linkClass = (id: string) =>
    `rounded px-1 py-2 text-sm transition-colors hover:text-ink ${
      activeId === id
        ? "text-ink underline decoration-violet decoration-2 underline-offset-8"
        : "text-ink-muted"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-space/90 backdrop-blur">
      {/* First thing a keyboard user can tab to: jump past the navigation */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded-md focus:bg-violet focus:px-4 focus:py-2 focus:text-space"
      >
        Skip to main content
      </a>

      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/#home" className="flex items-center gap-3 rounded">
          <Logo />
          <span className="font-display text-base font-semibold tracking-tight">
            {profile.brand}
          </span>
        </Link>

        {/* Desktop navigation (hidden below the md breakpoint) */}
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-5">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={'/#${item.id}'}
                  className={linkClass(item.id)}
                  aria-current={activeId === item.id ? "location" : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Button href={profile.contact.resume} size="sm">
            Résumé
          </Button>
        </nav>

        {/* Mobile menu button (visible only below md) */}
        <button
          ref={toggleRef}
          type="button"
          className="rounded-md border border-line p-2 text-ink hover:border-cyan md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-line bg-space md:hidden">
          <nav aria-label="Mobile" className="container-page flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={'/#${item.id}'}
                onClick={() => setMenuOpen(false)}
                aria-current={activeId === item.id ? "location" : undefined}
                className={`rounded-md px-3 py-3 text-base hover:bg-surface ${
                  activeId === item.id ? "bg-surface text-ink" : "text-ink-muted"
                }`}
              >
                {item.label}
              </a>
            ))}
            <Button href={profile.contact.resume} className="mt-3">
              Résumé
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}