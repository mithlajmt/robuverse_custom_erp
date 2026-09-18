import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function getPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  // Handle hot-reloading when new schema models like `lead` or `document` are added in dev mode
  if (process.env.NODE_ENV !== "production") {
    if (!globalForPrisma.prisma || !(globalForPrisma.prisma as any)?.document || !(globalForPrisma.prisma as any)?.lead) {
      globalForPrisma.prisma = new PrismaClient();
    }
  }

  return globalForPrisma.prisma || new PrismaClient();
}
