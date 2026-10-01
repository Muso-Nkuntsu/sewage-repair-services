/**
 * Creates (or updates) a permanent ADMIN account without touching any other data.
 *
 * Usage (Git Bash, from the project folder):
 *   ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="YourStrongPassword" \
 *   ADMIN_FIRST_NAME="Your" ADMIN_LAST_NAME="Name" npm run create-admin
 *
 * Optional: ADMIN_PHONE="071 234 5678"
 *
 * - If the email does not exist, a new ADMIN user is created.
 * - If it already exists, its password is reset and it is promoted to ADMIN.
 * - Uses DATABASE_URL, so it works on local MySQL or the cloud database.
 * - `npm run db:seed` keeps admin accounts created this way.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { phoneSchema } from "../lib/validations/common";

const prisma = new PrismaClient();

const inputSchema = z.object({
  email: z.string().trim().toLowerCase().email("ADMIN_EMAIL must be a valid email address."),
  password: z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters."),
  firstName: z.string().trim().min(1, "ADMIN_FIRST_NAME is required."),
  lastName: z.string().trim().min(1, "ADMIN_LAST_NAME is required."),
  phoneNumber: phoneSchema.optional(),
});

async function main() {
  const parsed = inputSchema.safeParse({
    email: process.env.ADMIN_EMAIL ?? "",
    password: process.env.ADMIN_PASSWORD ?? "",
    firstName: process.env.ADMIN_FIRST_NAME ?? "",
    lastName: process.env.ADMIN_LAST_NAME ?? "",
    phoneNumber: process.env.ADMIN_PHONE || undefined,
  });

  if (!parsed.success) {
    console.error("Could not create admin:");
    for (const issue of parsed.error.issues) console.error(`  - ${issue.message}`);
    console.error(
      '\nExample:\n  ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="YourStrongPassword" ADMIN_FIRST_NAME="Your" ADMIN_LAST_NAME="Name" npm run create-admin'
    );
    process.exit(1);
  }

  const { email, password, firstName, lastName, phoneNumber } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, password: passwordHash, firstName, lastName, phoneNumber: phoneNumber ?? null, role: "ADMIN" },
    update: { password: passwordHash, firstName, lastName, role: "ADMIN", ...(phoneNumber ? { phoneNumber } : {}) },
  });

  console.log(existing ? `Updated existing account and set it to ADMIN: ${user.email}` : `Created ADMIN account: ${user.email}`);
}

main()
  .catch((error) => {
    console.error("Failed to create admin. Check DATABASE_URL and that the tables exist.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
