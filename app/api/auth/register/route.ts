import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { startSession } from "@/lib/auth";
import { handleApiError, jsonError, parseBody } from "@/lib/api";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, registerSchema);
    const email = input.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return jsonError(409, "An account with this email already exists.", {
        email: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    // Role is always RESIDENT here. Admin accounts are created by the seed/SQL only.
    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        phoneNumber: input.phoneNumber,
        password: passwordHash,
        role: "RESIDENT",
      },
      select: { id: true, firstName: true, role: true },
    });

    await startSession(user);
    return NextResponse.json({ user: { id: user.id, firstName: user.firstName, role: user.role } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
