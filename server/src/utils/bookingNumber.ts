// =============================================================================
// Booking Number Generator
// Generates human-readable booking numbers in format: BK-YYYYMMDD-XXXX
// where XXXX is a random alphanumeric suffix.
// =============================================================================

/**
 * Generate a unique booking number.
 * Format: BK-20250708-A3X9
 */
export function generateBookingNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `BK-${year}${month}${day}-${suffix}`;
}
