// One list drives the desktop menu, the mobile menu, and the highlighted link.
// Each item is a real page (a folder inside /app).
export type NavItem = { href: string; label: string };

export const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/research", label: "Research" },
  { href: "/playground", label: "Playground" },
  { href: "/skills", label: "Skills" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
