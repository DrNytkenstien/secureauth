import crypto from 'crypto';

/**
 * Generate a random OTP of specified length
 * @param length - Length of OTP to generate (default: 6)
 * @returns Random numeric OTP string
 */
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/**
 * Generate a secure session token
 * @returns Secure random token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Hash password/token for storage (basic implementation)
 * In production, use bcrypt or argon2
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Normalize email (lowercase and trim)
 * @param email - Email to normalize
 * @returns Normalized email
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Get remaining time in milliseconds
 * @param expiresAt - Expiration date
 * @returns Remaining time in ms, 0 if expired
 */
export function getExpiryTime(expiresAt: Date): number {
  const remaining = expiresAt.getTime() - Date.now();
  return Math.max(0, remaining);
}

/**
 * Format error message for API response
 * @param code - Error code
 * @param message - Error message
 * @returns Formatted error object
 */
export function formatError(code: string, message: string) {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

/**
 * Format success response
 * @param data - Response data
 * @param message - Success message
 * @returns Formatted success response
 */
export function formatSuccess(data: unknown, message: string = 'Success') {
  return {
    success: true,
    message,
    data,
  };
}
