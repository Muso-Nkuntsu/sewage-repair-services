import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { startSession } from "@/lib/auth";
import { handleApiError, jsonError, parseBody } from "@/lib/api";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, loginSchema);

    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    const passwordMatches = user ? await bcrypt.compare(input.password, user.password) : false;

    if (!user || !passwordMatches) {
      // Same message for both cases so we don't reveal which emails exist.
      return jsonError(401, "Incorrect email or password.");
    }

    await startSession({ id: user.id, role: user.role, firstName: user.firstName });

    return NextResponse.json({
      user: { id: user.id, firstName: user.firstName, role: user.role },
      redirectTo: user.role === "ADMIN" ? "/admin" : "/dashboard",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
