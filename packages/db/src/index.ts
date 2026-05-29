import { PrismaClient } from '@prisma/client';

/**
 * A single PrismaClient instance is shared across the app. In development we
 * cache it on `globalThis` so Next.js hot-reloads don't open a new pool on
 * every change.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
