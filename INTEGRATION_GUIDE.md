# Frontend Integration Guide

This guide shows how to integrate the SecureAuth backend with your React frontend.

## 🔗 API Base URL

Update your frontend to use the backend API:

```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 📋 Integration Steps

### 1. Update EmailEntry Component

Modify your `EmailEntry.tsx` to call the backend:

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/components/AuthLayout';
import Logo from '@/components/Logo';

const API_BASE_URL = 'http://localhost:5000/api';

const EmailEntry: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Failed to send OTP');
        setIsLoading(false);
        return;
      }

      // Navigate to OTP verification page
      navigate('/verify', { 
        state: { 
          email,
          expiresIn: data.data.expiresIn 
        } 
      });
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 glow-subtle">
          <Logo />
          
          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
              Sign In
            </h1>
            <p className="text-muted-foreground">
              Enter your email to receive a verification code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="text-center text-lg"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EmailEntry;
```

### 2. Update OTPVerification Component

Modify your `OTPVerification.tsx`:

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import Logo from '@/components/Logo';

const API_BASE_URL = 'http://localhost:5000/api';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';
  const expiresIn = location.state?.expiresIn;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && value) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp(newOtp);

    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Failed to verify OTP');
        setOtp(Array(6).fill(''));
        setIsLoading(false);
        return;
      }

      // Store session ID
      localStorage.setItem('sessionId', data.data.sessionId);
      localStorage.setItem('userEmail', email);

      // Navigate to session created page
      navigate('/session-created', { 
        state: { 
          email,
          sessionId: data.data.sessionId 
        } 
      });
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || 'Failed to resend OTP');
        setIsResending(false);
        return;
      }

      setOtp(Array(6).fill(''));
      setError('');
      // Show success message
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 glow-subtle">
          <Logo />

          <div className="mb-8">
            <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
              Verify Your Email
            </h1>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to {email}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-2xl font-bold bg-input border border-border rounded-lg"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 text-sm text-destructive mb-6">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleVerify(otp.join(''))}
              disabled={isLoading || !otp.every(d => d !== '')}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Verify'}
            </button>
          </div>

          <button
            onClick={handleResend}
            disabled={isResending || isLoading}
            className="w-full mt-4 text-sm text-primary hover:underline"
          >
            {isResending ? 'Resending...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default OTPVerification;
```

### 3. Update SessionCreated Component

Modify your `SessionCreated.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Shield, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/AuthLayout';

const API_BASE_URL = 'http://localhost:5000/api';

const SessionCreated: React.FC = () => {
  const [showContent, setShowContent] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'your email';
  const sessionId = location.state?.sessionId || localStorage.getItem('sessionId');

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userEmail');
        navigate('/');
      }
    } catch (err) {
      console.error('Logout failed:', err);
      // Still clear local storage and navigate
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userEmail');
      navigate('/');
    }
  };

  return (
    <AuthLayout>
      <div className={`w-full max-w-md transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 text-center glow-subtle">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
            Session Created
          </h1>
          <p className="text-muted-foreground mb-8">
            You've been successfully authenticated as{' '}
            <span className="text-foreground font-medium">{email}</span>
          </p>

          <div className="bg-secondary/50 border border-border rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Active Session</span>
              </div>
              <span className="text-xs text-muted-foreground">Just now</span>
            </div>
            <div className="space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Session ID</span>
                <span className="text-foreground font-mono text-xs truncate">{sessionId?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="text-foreground">24 hours</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="w-full"
            >
              {isLoggingOut ? 'Logging out...' : <><LogOut className="mr-2 h-4 w-4" /> Logout</>}
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-border space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-muted-foreground">
                  Your session is secure and will remain active for the next 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SessionCreated;
```

## 🔐 Session Management

### Store Session ID
```typescript
// After successful OTP verification
localStorage.setItem('sessionId', response.data.sessionId);
```

### Use Session ID in Protected Routes
```typescript
const sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
  navigate('/'); // Redirect to login
}
```

### Validate Session
```typescript
const response = await fetch(`${API_BASE_URL}/auth/session/${sessionId}`);
const { success, data } = await response.json();
if (!success) {
  localStorage.removeItem('sessionId');
  navigate('/'); // Redirect to login
}
```

## 🔌 API Client Utility

Create a reusable API client:

```typescript
// src/utils/api.ts
const API_BASE_URL = 'http://localhost:5000/api';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const sessionId = localStorage.getItem('sessionId');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (sessionId) {
    headers['Authorization'] = `Bearer ${sessionId}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('sessionId');
      window.location.href = '/';
    }
    throw new Error(data.error?.message || 'API Error');
  }

  return data;
}
```

## ✅ Testing the Integration

1. Start the backend: `npm run dev` in the `backend` folder
2. Start the frontend: `npm run dev` in the `secureauth` folder
3. Navigate to http://localhost:5173
4. Enter an email and submit
5. Check the backend console for the OTP
6. Enter the OTP in the frontend
7. You should be redirected to the session created page

## 🐛 Common Issues

### CORS Error
- Ensure backend is running on `http://localhost:5000`
- Check `CORS_ORIGIN` in `.env` matches your frontend URL

### OTP Not Appearing
- In development, the OTP is logged to the backend console
- Make sure backend is running

### Session Not Persisting
- Sessions are stored in memory and cleared on server restart
- For production, use a database

## 📝 Additional Resources

- [Backend API Documentation](./backend/README.md)
- [Frontend Component Files](./secureauth/src/pages/)
