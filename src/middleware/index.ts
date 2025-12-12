import { Request, Response, NextFunction } from 'express';
import { store } from '../models';

/**
 * Authenticate session middleware
 * Verifies that a valid session ID is provided in the Authorization header
 */
export async function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_AUTH_HEADER',
          message: 'Authorization header is required',
        },
      });
      return;
    }

    const sessionId = authHeader.substring(7); // Remove "Bearer " prefix
    const session = await store.getSessionById(sessionId);

    if (!session) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Invalid or expired session',
        },
      });
      return;
    }

    // Attach session to request
    (req as any).session = session;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed',
      },
    });
  }
}

/**
 * Error handling middleware
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
    },
  });
}

/**
 * Request validation middleware
 */
export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type must be application/json',
        },
      });
      return;
    }
  }

  next();
}

/**
 * Request logging middleware
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  const method = req.method;
  const path = req.path;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    console.log(
      `[${new Date().toISOString()}] ${method} ${path} - ${statusCode} (${duration}ms)`
    );
  });

  next();
}
