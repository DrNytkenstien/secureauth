import { Request, Response } from 'express';
import { store } from '../models';
import {
  generateOTP,
  isValidEmail,
  normalizeEmail,
  formatError,
  formatSuccess,
} from '../utils/helpers';
import { emailService } from '../utils/emailService';
import { config } from '../config';

export class AuthController {
  /**
   * Step 1: Send OTP to email
   * POST /api/auth/email
   */
  static async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Validate email
      if (!email || typeof email !== 'string') {
        res.status(400).json(
          formatError('INVALID_EMAIL', 'Email is required')
        );
        return;
      }

      const normalizedEmail = normalizeEmail(email);

      if (!isValidEmail(normalizedEmail)) {
        res.status(400).json(
          formatError('INVALID_EMAIL_FORMAT', 'Please provide a valid email address')
        );
        return;
      }

      // Check if OTP was recently sent (rate limiting)
      const existingOTP = await store.getOTPByEmail(normalizedEmail);
      if (existingOTP) {
        const timeSinceCreation = Date.now() - existingOTP.createdAt.getTime();
        const oneMinute = 60 * 1000;

        if (timeSinceCreation < oneMinute) {
          res.status(429).json(
            formatError(
              'OTP_RECENTLY_SENT',
              `Please wait before requesting a new OTP. Try again in ${Math.ceil((oneMinute - timeSinceCreation) / 1000)} seconds.`
            )
          );
          return;
        }

        // Delete old OTP
        await store.deleteOTPByEmail(normalizedEmail);
      }

      // Generate OTP
      const otp = generateOTP(config.otp.length);

      // Save OTP to store
      await store.saveOTP(
        normalizedEmail,
        otp,
        config.otp.expiryMinutes
      );

      // Send email
      const emailSent = await emailService.sendOTPEmail(
        normalizedEmail,
        otp
      );

      if (!emailSent) {
        res.status(500).json(
          formatError('EMAIL_SEND_FAILED', 'Failed to send OTP email')
        );
        return;
      }

      // Create or update user (no return value needed here)
      await store.createUser(normalizedEmail);

      res.status(200).json(
        formatSuccess(
          {
            message: 'OTP sent successfully',
            email: normalizedEmail,
            expiresIn: config.otp.expiryMinutes * 60,
          },
          'OTP sent to your email'
        )
      );
    } catch (error) {
      console.error('Error in sendOTP:', error);
      res.status(500).json(
        formatError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
      );
    }
  }

  /**
   * Step 2: Verify OTP and create session
   * POST /api/auth/verify
   */
  static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;

      // Validate inputs
      if (!email || !otp) {
        res.status(400).json(
          formatError('MISSING_FIELDS', 'Email and OTP are required')
        );
        return;
      }

      const normalizedEmail = normalizeEmail(email);

      // Verify OTP
      const isValid = await store.verifyOTP(normalizedEmail, otp);

      if (!isValid) {
        const otpRecord = await store.getOTPByEmail(normalizedEmail);

        if (!otpRecord) {
          res.status(401).json(
            formatError('OTP_EXPIRED', 'OTP has expired. Please request a new one.')
          );
          return;
        }

        const remainingAttempts =
          otpRecord.maxAttempts - otpRecord.attempts;

        if (remainingAttempts <= 0) {
          await store.deleteOTPByEmail(normalizedEmail);
          res.status(401).json(
            formatError(
              'OTP_ATTEMPTS_EXCEEDED',
              'Maximum OTP verification attempts exceeded. Please request a new OTP.'
            )
          );
          return;
        }

        res.status(401).json(
          formatError(
            'INVALID_OTP',
            `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
          )
        );
        return;
      }

      // Get or create user
      const user = await store.createUser(normalizedEmail);

      // Create session
      const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
      const userAgent = req.headers['user-agent'];

      const session = await store.createSession(
        user.id,
        normalizedEmail,
        config.session.expiryHours,
        ipAddress,
        userAgent
      );

      // Send confirmation email
      await emailService.sendSessionConfirmationEmail(normalizedEmail);

      res.status(200).json(
        formatSuccess(
          {
            sessionId: session.id,
            email: user.email,
            userId: user.id,
            expiresIn: config.session.expiryHours * 60 * 60,
            expiresAt: session.expiresAt.toISOString(),
          },
          'Session created successfully'
        )
      );
    } catch (error) {
      console.error('Error in verifyOTP:', error);
      res.status(500).json(
        formatError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
      );
    }
  }

  /**
   * Check if session is valid
   * GET /api/auth/session/:sessionId
   */
  static async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json(
          formatError('MISSING_SESSION_ID', 'Session ID is required')
        );
        return;
      }

      const session = store.getSessionById(sessionId);

      if (!session) {
        res.status(401).json(
          formatError('INVALID_SESSION', 'Session is invalid or expired')
        );
        return;
      }

      res.status(200).json(
        formatSuccess(
          {
            sessionId: session.id,
            email: session.email,
            userId: session.userId,
            createdAt: session.createdAt.toISOString(),
            expiresAt: session.expiresAt.toISOString(),
            isValid: true,
          },
          'Session is valid'
        )
      );
    } catch (error) {
      console.error('Error in getSession:', error);
      res.status(500).json(
        formatError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
      );
    }
  }

  /**
   * Logout and invalidate session
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        res.status(400).json(
          formatError('MISSING_SESSION_ID', 'Session ID is required')
        );
        return;
      }

      const deleted = await store.deleteSession(sessionId);

      if (!deleted) {
        res.status(400).json(
          formatError('SESSION_NOT_FOUND', 'Session not found')
        );
        return;
      }

      res.status(200).json(
        formatSuccess(
          {
            message: 'Logged out successfully',
          },
          'Session terminated'
        )
      );
    } catch (error) {
      console.error('Error in logout:', error);
      res.status(500).json(
        formatError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
      );
    }
  }

  /**
   * Resend OTP
   * POST /api/auth/resend-otp
   */
  static async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json(
          formatError('INVALID_EMAIL', 'Email is required')
        );
        return;
      }

      const normalizedEmail = normalizeEmail(email);

      if (!isValidEmail(normalizedEmail)) {
        res.status(400).json(
          formatError('INVALID_EMAIL_FORMAT', 'Please provide a valid email address')
        );
        return;
      }

      // Delete existing OTP
      await store.deleteOTPByEmail(normalizedEmail);

      // Generate new OTP
      const otp = generateOTP(config.otp.length);
      await store.saveOTP(normalizedEmail, otp, config.otp.expiryMinutes);

      // Send email
      const emailSent = await emailService.sendOTPEmail(normalizedEmail, otp);

      if (!emailSent) {
        res.status(500).json(
          formatError('EMAIL_SEND_FAILED', 'Failed to send OTP email')
        );
        return;
      }

      res.status(200).json(
        formatSuccess(
          {
            message: 'OTP resent successfully',
            email: normalizedEmail,
            expiresIn: config.otp.expiryMinutes * 60,
          },
          'New OTP sent to your email'
        )
      );
    } catch (error) {
      console.error('Error in resendOTP:', error);
      res.status(500).json(
        formatError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
      );
    }
  }

  /**
   * Get stats (for monitoring)
   * GET /api/auth/stats
   */
  static async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await store.getStats();
      res.status(200).json(formatSuccess(stats, 'Stats retrieved'));
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json(
        formatError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
      );
    }
  }
}
