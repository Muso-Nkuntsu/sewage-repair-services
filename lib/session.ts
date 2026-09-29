// Session token helpers built on `jose`, which works both in Node.js
// route handlers and in the Edge runtime used by middleware.
import { SignJWT, jwtVerify } from "jose";
import type { RoleValue } from "./constants";

export type SessionPayload = {
  userId: number;
  role: RoleValue;
  firstName: string;
};

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "NEXTAUTH_SECRET is missing or too short. Set it in your .env file (at least 16 characters)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, firstName: payload.firstName })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    const userId = Number(payload.sub);
    const role = payload.role;
    if (!Number.isInteger(userId) || (role !== "ADMIN" && role !== "RESIDENT")) {
      return null;
    }
    return {
      userId,
      role,
      firstName: typeof payload.firstName === "string" ? payload.firstName : "",
    };
  } catch {
    return null;
  }
}
