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

    // Only start server listener and cron jobs if not running on Vercel Serverless
    if (!process.env.VERCEL) {
      // Schedule background jobs
      scheduleBookingExpiry();

      // Start the HTTP server
      app.listen(PORT, () => {
        logger.info(`🚀 LocalLink API server running on port ${PORT}`);
        logger.info(`📍 Environment: ${env.NODE_ENV}`);
        logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
        logger.info(`📘 API Base: http://localhost:${PORT}/api/v1`);
      });
    }
  } catch (error) {
    logger.error({ error }, '❌ Failed to start server');
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

// Graceful shutdown
if (!process.env.VERCEL) {
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
}

main();

export default app;
