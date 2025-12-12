import { v4 as uuidv4 } from 'uuid';

// In-memory store for users, OTP records, and sessions
export interface User {
  id: string;
  email: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface OTPRecord {
  id: string;
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

export interface Session {
  id: string;
  email: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

class InMemoryStore {
  private users: Map<string, User> = new Map();
  private otpRecords: Map<string, OTPRecord> = new Map();
  private sessions: Map<string, Session> = new Map();
  private emailToUserId: Map<string, string> = new Map();

  // User operations
  getUserByEmail(email: string): User | null {
    const userId = this.emailToUserId.get(email.toLowerCase());
    return userId ? this.users.get(userId) || null : null;
  }

  createUser(email: string): User {
    const existingUser = this.getUserByEmail(email);
    if (existingUser) {
      existingUser.lastLogin = new Date();
      return existingUser;
    }

    const user: User = {
      id: uuidv4(),
      email: email.toLowerCase(),
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    this.users.set(user.id, user);
    this.emailToUserId.set(user.email, user.id);
    return user;
  }

  // OTP operations
  saveOTP(email: string, otp: string, expiryMinutes: number): OTPRecord {
    const otpRecord: OTPRecord = {
      id: uuidv4(),
      email: email.toLowerCase(),
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
      attempts: 0,
      maxAttempts: 5,
    };

    this.otpRecords.set(otpRecord.id, otpRecord);
    return otpRecord;
  }

  getOTPByEmail(email: string): OTPRecord | null {
    for (const record of this.otpRecords.values()) {
      if (
        record.email === email.toLowerCase() &&
        record.expiresAt > new Date()
      ) {
        return record;
      }
    }
    return null;
  }

  verifyOTP(email: string, otp: string): boolean {
    const record = this.getOTPByEmail(email);
    if (!record) return false;

    if (record.attempts >= record.maxAttempts) {
      this.otpRecords.delete(record.id);
      return false;
    }

    record.attempts++;

    if (record.otp === otp) {
      this.otpRecords.delete(record.id);
      return true;
    }

    return false;
  }

  deleteOTPByEmail(email: string): void {
    for (const [id, record] of this.otpRecords.entries()) {
      if (record.email === email.toLowerCase()) {
        this.otpRecords.delete(id);
      }
    }
  }

  // Session operations
  createSession(
    userId: string,
    email: string,
    expiryHours: number,
    ipAddress?: string,
    userAgent?: string
  ): Session {
    const session: Session = {
      id: uuidv4(),
      userId,
      email: email.toLowerCase(),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000),
      ipAddress,
      userAgent,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSessionById(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        this.sessions.delete(sessionId);
      }
      return null;
    }
    return session;
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  deleteAllSessionsByEmail(email: string): void {
    for (const [id, session] of this.sessions.entries()) {
      if (session.email === email.toLowerCase()) {
        this.sessions.delete(id);
      }
    }
  }

  // Cleanup expired OTPs and sessions (run periodically)
  cleanupExpiredRecords(): void {
    const now = new Date();

    // Clean expired OTPs
    for (const [id, record] of this.otpRecords.entries()) {
      if (record.expiresAt < now) {
        this.otpRecords.delete(id);
      }
    }

    // Clean expired sessions
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
      }
    }
  }

  // Get statistics (for debugging/monitoring)
  getStats() {
    return {
      totalUsers: this.users.size,
      activeOTPs: this.otpRecords.size,
      activeSessions: this.sessions.size,
    };
  }
}

// Export singleton instance
export const store = new InMemoryStore();

// Run cleanup every 5 minutes
setInterval(() => {
  store.cleanupExpiredRecords();
}, 5 * 60 * 1000);
