/**
 * Utility for generating secure random tokens
 */

import crypto from 'crypto';

/**
 * Generate a secure random token for invitations
 * @param length - Length of the token in bytes (will be hex-encoded, so actual string length is 2x)
 * @returns Hex-encoded random token
 */
export const generateInvitationToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};
