import { getCurrentUser } from "@/lib/auth";
import { NavbarClient, type NavLink } from "./NavbarClient";

const publicLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#services", label: "Services" },
];

const residentLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Report Issue" },
  { href: "/my-reports", label: "My Reports" },
];

const adminLinks: NavLink[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/inspections", label: "Inspections" },
];

/** Server component: picks the right links for the signed-in role. */
export async function Navbar() {
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    // If MySQL is down, still render the public navbar instead of crashing the page.
    console.error("[navbar] could not load current user", error);
  }

  const links = !user ? publicLinks : user.role === "ADMIN" ? adminLinks : residentLinks;

  return (
    <NavbarClient
      links={links}
      user={user ? { firstName: user.firstName, role: user.role } : null}
      homeHref={!user ? "/" : user.role === "ADMIN" ? "/admin" : "/"}
    />
  );
}
