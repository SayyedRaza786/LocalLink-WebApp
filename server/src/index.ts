// =============================================================================
// Server Entry Point
// Bootstraps the Express server and schedules background jobs.
// =============================================================================

import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './config/database';
import { scheduleBookingExpiry } from './jobs/expireBookings';

const PORT = env.PORT;

async function main() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Schedule background jobs
    scheduleBookingExpiry();

    // Start the HTTP server
    app.listen(PORT, () => {
      logger.info(`🚀 LocalLink API server running on port ${PORT}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📘 API Base: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error({ error }, '❌ Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
