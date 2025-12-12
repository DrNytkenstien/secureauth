import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config';
import connectDB from './config/db';
import {
  errorHandler,
  validateRequest,
  requestLogger,
} from './middleware';
import authRoutes from './routes/authRoutes';

const app: Express = express();

/**
 * Security & Middleware Setup
 */

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use(requestLogger);

// Request validation
app.use(validateRequest);

/**
 * Health Check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

/**
 * Error Handler
 */
app.use(errorHandler);

/**
 * Start Server
 */
const port = config.port;

let server: any = null;

async function start() {
  try {
    await connectDB();

    server = app.listen(port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                     SecureAuth Backend API                    ║
╠═══════════════════════════════════════════════════════════════╣
║  🚀 Server running on http://localhost:${port}
║  📝 Environment: ${config.nodeEnv}
║  🔒 CORS Origin: ${config.corsOrigin}
║  ⏱️  OTP Expiry: ${config.otp.expiryMinutes} minutes
║  ⏱️  Session Expiry: ${config.session.expiryHours} hours
╠═══════════════════════════════════════════════════════════════╣
║                       Available Routes                        ║
╠═══════════════════════════════════════════════════════════════╣
║  GET    /health                  - Health check
║  POST   /api/auth/email          - Send OTP to email
║  POST   /api/auth/verify         - Verify OTP & create session
║  POST   /api/auth/resend-otp     - Resend OTP
║  GET    /api/auth/session/:id    - Get session details
║  POST   /api/auth/logout         - Logout (invalidate session)
║  GET    /api/auth/stats          - Get system stats
╚═══════════════════════════════════════════════════════════════╝
  `);
    });
  } catch (err) {
    console.error('Failed to start server due to error:', err);
    process.exit(1);
  }
}

start();

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
