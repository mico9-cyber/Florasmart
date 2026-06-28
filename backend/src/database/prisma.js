import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';
import { databaseConfig } from '../config/database.js';

let prisma;

export function getPrismaClient() {
  if (!prisma) {
    logger.debug('Initializing Prisma client', { provider: databaseConfig.provider });
    prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' }
      ]
    });

    prisma.$on('query', (event) => {
      logger.debug('Database query executed', {
        duration: event.duration,
        target: event.target,
      });
    });

    prisma.$on('warn', (event) => {
      logger.warn('Database warning', { message: event.message, target: event.target });
    });

    prisma.$on('error', (event) => {
      logger.error('Database error', { message: event.message, target: event.target });
    });
  }

  return prisma;
}

export async function connectDatabase() {
  const client = getPrismaClient();
  await client.$connect();
  return client;
}

export async function disconnectDatabase() {
  if (!prisma) {
    return;
  }

  await prisma.$disconnect();
}

