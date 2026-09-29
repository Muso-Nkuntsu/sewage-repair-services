"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { LogoutButton } from "./LogoutButton";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";
import type { RoleValue } from "@/lib/constants";

export type NavLink = { href: string; label: string };

type NavbarClientProps = {
  links: NavLink[];
  user: { firstName: string; role: RoleValue } | null;
  homeHref: string;
};

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  if (href === "/" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavbarClient({ links, user, homeHref }: NavbarClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const linkClass = (href: string) =>
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive(pathname, href) ? "bg-brand-light text-brand" : "text-slate-700 hover:bg-slate-100 hover:text-navy"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="page-container flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Logo href={homeHref} />

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-muted">
                Hi, <span className="font-semibold text-navy">{user.firstName}</span>
                {user.role === "ADMIN" ? (
                  <span className="ml-2 rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Admin
                  </span>
                ) : null}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClasses("ghost", "sm")}>
                Log in
              </Link>
              <Link href="/register" className={buttonClasses("primary", "sm")}>
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-md p-2 text-navy hover:bg-slate-100 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>

      {open ? (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white md:hidden">
          <div className="page-container flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-slate-100 pt-3">
              {user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    Signed in as <span className="font-semibold text-navy">{user.firstName}</span>
                  </span>
                  <LogoutButton />
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className={buttonClasses("secondary", "md", "flex-1")}>
                    Log in
                  </Link>
                  <Link href="/register" className={buttonClasses("primary", "md", "flex-1")}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
