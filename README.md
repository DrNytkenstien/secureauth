# SecureAuth Backend API

Session-Based Authentication with Email OTP Verification Backend

## 📋 Overview

This backend API implements a secure two-step authentication flow:
1. **Email Entry** - User requests an OTP to their email
2. **OTP Verification** - User verifies the OTP and creates a session

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun 1.3.4+
- npm or bun package manager

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Email service (optional - logs to console in dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@secureauth.com

# OTP Settings
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=10

# Session Settings
SESSION_EXPIRY_HOURS=24
SESSION_SECRET=your_super_secret_key_change_this
```

### Running the Server

```bash
# Development with auto-reload
npm run dev

# Production build
npm run build
npm start

# With bun
bun run dev
bun run build
bun start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### 1. Send OTP to Email

**POST** `/api/auth/email`

Send a One-Time Password to the user's email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "message": "OTP sent successfully",
    "email": "user@example.com",
    "expiresIn": 600
  }
}
```

**Error Responses:**
- `400` - Invalid or missing email
- `429` - OTP recently sent (rate limited)
- `500` - Email sending failed

**Rate Limiting:** 1 OTP per minute per email

---

### 2. Verify OTP & Create Session

**POST** `/api/auth/verify`

Verify the OTP and create an authenticated session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "expiresIn": 86400,
    "expiresAt": "2025-12-13T18:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing email or OTP
- `401` - Invalid or expired OTP
- `401` - Max OTP attempts exceeded
- `500` - Internal server error

**Validation:**
- OTP must be exactly 6 digits
- OTP expires after 10 minutes
- Max 5 verification attempts per OTP

---

### 3. Resend OTP

**POST** `/api/auth/resend-otp`

Request a new OTP for an email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "New OTP sent to your email",
  "data": {
    "message": "OTP resent successfully",
    "email": "user@example.com",
    "expiresIn": 600
  }
}
```

---

### 4. Get Session Details

**GET** `/api/auth/session/:sessionId`

Retrieve details about an active session.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Session is valid",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "createdAt": "2025-12-12T18:30:00.000Z",
    "expiresAt": "2025-12-13T18:30:00.000Z",
    "isValid": true
  }
}
```

**Error Responses:**
- `400` - Missing session ID
- `401` - Invalid or expired session

---

### 5. Logout

**POST** `/api/auth/logout`

Invalidate a session and logout the user.

**Request Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Session terminated",
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### 6. System Stats (Development Only)

**GET** `/api/auth/stats`

Get current system statistics.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stats retrieved",
  "data": {
    "totalUsers": 42,
    "activeOTPs": 3,
    "activeSessions": 15
  }
}
```

---

### 7. Health Check

**GET** `/health`

Check if the server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-12-12T18:30:00.000Z",
  "environment": "development"
}
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.ts      # Authentication logic
│   ├── models/
│   │   └── store.ts               # In-memory data store
│   ├── routes/
│   │   └── authRoutes.ts          # Route definitions
│   ├── middleware/
│   │   └── index.ts               # Auth & error middlewares
│   ├── utils/
│   │   ├── helpers.ts             # Utility functions
│   │   └── emailService.ts        # Email sending service
│   ├── config/
│   │   └── index.ts               # Configuration
│   └── index.ts                   # Main server file
├── dist/                          # Compiled JS (after build)
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── .eslintrc.json
└── README.md
```

## 🔒 Security Features

### Implemented

1. **OTP Expiry** - OTPs expire after 10 minutes
2. **Rate Limiting** - 1 OTP per minute per email
3. **Attempt Limiting** - Max 5 verification attempts per OTP
4. **Session Expiry** - Sessions expire after 24 hours
5. **CORS Protection** - Strict CORS configuration
6. **Helmet Security Headers** - XSS, clickjacking protection
7. **Email Validation** - Format validation for all emails
8. **Session Isolation** - Each session has unique ID
9. **IP & User-Agent Tracking** - Optional session tracking

### Recommendations for Production

1. **Database Integration**
   - Replace in-memory store with MongoDB/PostgreSQL
   - Add proper indexing on emails
   - Enable transaction support

2. **Email Service**
   - Integrate SendGrid, AWS SES, or Mailgun
   - Add retry logic with exponential backoff
   - Template management

3. **Authentication**
   - Implement JWT tokens instead of session IDs
   - Add refresh token mechanism
   - Implement 2FA for sensitive operations

4. **Rate Limiting**
   - Use express-rate-limit middleware
   - Implement per-IP and per-email limits
   - Add DDoS protection

5. **Logging & Monitoring**
   - Add structured logging (Winston, Pino)
   - Implement error tracking (Sentry)
   - Add performance monitoring

6. **Testing**
   - Add unit tests (Jest)
   - Add integration tests
   - Add load testing

7. **Encryption**
   - Encrypt sensitive data at rest
   - Use TLS/SSL for all connections
   - Implement proper key management

## 📚 Data Models

### User
```typescript
{
  id: string;           // UUID
  email: string;        // Normalized lowercase
  createdAt: Date;
  lastLogin?: Date;
}
```

### OTP Record
```typescript
{
  id: string;
  email: string;
  otp: string;          // 6-digit code
  createdAt: Date;
  expiresAt: Date;      // 10 minutes from creation
  attempts: number;     // Current attempt count
  maxAttempts: number;  // 5 max attempts
}
```

### Session
```typescript
{
  id: string;           // UUID (used as token)
  email: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;      // 24 hours from creation
  ipAddress?: string;
  userAgent?: string;
}
```

## 🔌 Frontend Integration

### Step 1: Request OTP

```typescript
const response = await fetch('http://localhost:5000/api/auth/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});
const data = await response.json();
// data.data.expiresIn = seconds until OTP expires
```

### Step 2: Verify OTP

```typescript
const response = await fetch('http://localhost:5000/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com',
    otp: '123456'
  })
});
const data = await response.json();
// data.data.sessionId = use as Bearer token
```

### Step 3: Use Session

```typescript
// Store sessionId in localStorage
localStorage.setItem('sessionId', data.data.sessionId);

// Use in subsequent requests
const response = await fetch('http://localhost:5000/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
  }
});
```

## 🧪 Testing with cURL

```bash
# 1. Send OTP
curl -X POST http://localhost:5000/api/auth/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# 2. Verify OTP (use OTP from console/email)
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'

# 3. Get session
curl http://localhost:5000/api/auth/session/SESSION_ID_HERE

# 4. Logout
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"SESSION_ID_HERE"}'

# 5. Check health
curl http://localhost:5000/health
```

## 📝 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |
| `OTP_LENGTH` | 6 | OTP digit count |
| `OTP_EXPIRY_MINUTES` | 10 | OTP validity duration |
| `SESSION_EXPIRY_HOURS` | 24 | Session validity duration |
| `SMTP_HOST` | smtp.gmail.com | Email service host |
| `SMTP_PORT` | 587 | Email service port |
| `SMTP_USER` | - | Email service username |
| `SMTP_PASSWORD` | - | Email service password |

## 🐛 Troubleshooting

### OTP not sending
- In development, check console for OTP
- Verify email configuration in `.env`
- Check email service credentials

### CORS errors
- Ensure `CORS_ORIGIN` matches frontend URL
- Check browser console for specific error

### Session not valid
- Check if session ID is correct
- Verify session hasn't expired (24 hours)
- Sessions are not persisted across server restarts

### TypeScript errors
- Run `npm install` to ensure all types are installed
- Check `tsconfig.json` is in root directory

## 🚀 Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "dist/index.js"]
```

### Environment Variables (Production)

Always set in your hosting platform:
- `NODE_ENV=production`
- `CORS_ORIGIN` to your frontend domain
- Proper email service credentials
- Change `SESSION_SECRET`

## 📄 License

MIT

## 👤 Support

For issues and questions, please create an issue in the repository.
