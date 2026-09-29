// Route protection. Runs before every matched page request.
// API routes do their own checks (and return JSON errors), so they are not matched here.
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { verifySession } from "@/lib/session";

const RESIDENT_ONLY = ["/dashboard", "/my-reports"];
const SIGNED_IN = ["/report", "/reports"];
const ADMIN_ONLY = ["/admin"];
const GUEST_ONLY = ["/login", "/register"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const home = session?.role === "ADMIN" ? "/admin" : "/dashboard";

  if (matches(pathname, GUEST_ONLY)) {
    return session ? NextResponse.redirect(new URL(home, request.url)) : NextResponse.next();
  }

  const needsLogin = matches(pathname, [...RESIDENT_ONLY, ...SIGNED_IN, ...ADMIN_ONLY]);
  if (needsLogin && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && matches(pathname, ADMIN_ONLY) && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session && matches(pathname, RESIDENT_ONLY) && session.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-reports/:path*",
    "/report/:path*",
    "/reports/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
