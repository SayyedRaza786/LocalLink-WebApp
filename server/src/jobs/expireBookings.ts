// =============================================================================
// Expire Bookings Cron Job
// Runs every hour to expire PENDING bookings older than 24 hours.
// Updates status to EXPIRED.
// =============================================================================

import cron from 'node-cron';
import { prisma } from '../config/database';
import { BookingStatus } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Expire stale PENDING bookings.
 * Bookings not accepted within 24 hours are automatically expired.
 */
async function expireStaleBookings() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  try {
    const result = await prisma.booking.updateMany({
      where: {
        status: BookingStatus.PENDING,
        createdAt: { lt: cutoff },
      },
      data: {
        status: BookingStatus.EXPIRED,
      },
    });

    if (result.count > 0) {
      logger.info(`Expired ${result.count} stale booking(s)`);
    }
  } catch (error) {
    logger.error({ error }, 'Failed to expire stale bookings');
  }
}

/**
 * Schedule the booking expiry job.
 * Runs every hour at minute 0.
 */
export function scheduleBookingExpiry() {
  cron.schedule('0 * * * *', () => {
    logger.debug('Running booking expiry job...');
    expireStaleBookings();
  });

  logger.info('Booking expiry cron job scheduled (every hour)');
}
