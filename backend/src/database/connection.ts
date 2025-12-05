import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
let prisma: PrismaClient;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });

    // Handle connection errors
    prisma.$connect().catch(() => {
      process.exit(1);
    });

    // Graceful shutdown
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });

    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }

  return prisma;
};

export default getPrismaClient;
