import { Prisma } from '@prisma/client';
import { getPrismaClient } from './connection.js';

export type TransactionCallback<T> = (
  tx: Prisma.TransactionClient
) => Promise<T>;

export const executeTransaction = async <T>(
  callback: TransactionCallback<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  }
): Promise<T> => {
  const prisma = getPrismaClient();

  return prisma.$transaction(callback, {
    maxWait: options?.maxWait || 5000, // Default 5 seconds
    timeout: options?.timeout || 10000, // Default 10 seconds
    isolationLevel: options?.isolationLevel,
  });
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on certain errors
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2002' || // Unique constraint violation
          error.code === 'P2025') // Record not found
      ) {
        throw error;
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
};
