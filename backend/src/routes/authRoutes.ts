import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

/**
 * Authentication Routes
 */

// Step 1: Request OTP
router.post('/email', AuthController.sendOTP);

// Step 2: Verify OTP and create session
router.post('/verify', AuthController.verifyOTP);

// Resend OTP
router.post('/resend-otp', AuthController.resendOTP);

// Get session details
router.get('/session/:sessionId', AuthController.getSession);

// Logout
router.post('/logout', AuthController.logout);

// Health check / Stats (remove in production or protect with middleware)
router.get('/stats', AuthController.getStats);

export default router;
