import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaVersion?: string;
};

const SCHEMA_VERSION = '2026-11-25-v4-whatsapp-fix';

export const prisma =
  globalForPrisma.prisma && globalForPrisma.prismaVersion === SCHEMA_VERSION
    ? globalForPrisma.prisma
    : new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaVersion = SCHEMA_VERSION;
}
