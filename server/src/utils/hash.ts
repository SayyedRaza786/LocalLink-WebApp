// =============================================================================
// Password Hashing Utilities
// Wraps bcryptjs for password hashing and comparison.
// Cost factor 12 balances security and performance (~250ms per hash).
// =============================================================================

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
