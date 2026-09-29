// Server-side authentication helpers (pages, layouts and route handlers).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { SESSION_COOKIE, type RoleValue } from "./constants";
import { SESSION_MAX_AGE_SECONDS, signSession, verifySession } from "./session";

export type CurrentUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  role: RoleValue;
};

/** Creates the signed session cookie after a successful login/registration. */
export async function startSession(user: { id: number; role: RoleValue; firstName: string }) {
  const token = await signSession({ userId: user.id, role: user.role, firstName: user.firstName });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Returns the logged-in user (loaded fresh from MySQL), or null.
 * Loading from the database means a deleted account is logged out immediately
 * and role changes take effect without re-login.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, role: true },
  });
  return user;
}

/** For pages: any logged-in user, otherwise redirect to /login. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** For pages: admin only. Residents are sent to their own dashboard. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

/** For pages: resident area. Admins are sent to the admin dashboard. */
export async function requireResident(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  return user;
}
