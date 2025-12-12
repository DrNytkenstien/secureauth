import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface IUser extends Document {
  email: string;
  createdAt: Date;
  lastLogin?: Date;
}

interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

interface ISession extends Document {
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  createdAt: { type: Date, default: () => new Date() },
  lastLogin: { type: Date },
});

const OTPSchema = new Schema<IOTP>({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
  expiresAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
});

// TTL index could be created in MongoDB for automatic removal based on expiresAt

const SessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  createdAt: { type: Date, default: () => new Date() },
  expiresAt: { type: Date, required: true, index: true },
  ipAddress: { type: String },
  userAgent: { type: String },
});

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model('User', UserSchema);
const OTPModel: Model<IOTP> = mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
const SessionModel: Model<ISession> = mongoose.models.Session || mongoose.model('Session', SessionSchema);

export class MongoStore {
  async getUserByEmail(email: string) {
    return await UserModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async createUser(email: string) {
    const normalized = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalized }).exec();
    if (existing) {
      existing.lastLogin = new Date();
      await existing.save();
      return existing;
    }

    const user = new UserModel({ email: normalized, lastLogin: new Date() });
    await user.save();
    return user;
  }

  async saveOTP(email: string, otp: string, expiryMinutes: number) {
    const normalized = email.toLowerCase().trim();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const otpDoc = new OTPModel({ email: normalized, otp, expiresAt });
    await otpDoc.save();
    return otpDoc;
  }

  async getOTPByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    const now = new Date();
    const doc = await OTPModel.findOne({ email: normalized, expiresAt: { $gt: now } }).sort({ createdAt: -1 }).exec();
    return doc;
  }

  async verifyOTP(email: string, otp: string) {
    const normalized = email.toLowerCase().trim();
    const doc = await OTPModel.findOne({ email: normalized }).sort({ createdAt: -1 }).exec();
    if (!doc) return false;

    if (doc.expiresAt < new Date()) {
      await OTPModel.deleteOne({ _id: doc._id }).exec();
      return false;
    }

    if (doc.attempts >= doc.maxAttempts) {
      await OTPModel.deleteOne({ _id: doc._id }).exec();
      return false;
    }

    doc.attempts += 1;
    if (doc.otp === otp) {
      await OTPModel.deleteOne({ _id: doc._id }).exec();
      return true;
    }

    await doc.save();
    return false;
  }

  async deleteOTPByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    await OTPModel.deleteMany({ email: normalized }).exec();
  }

  async createSession(userId: string, email: string, expiryHours: number, ipAddress?: string, userAgent?: string) {
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    const sessionId = uuidv4();
    const session = new SessionModel({ sessionId, userId, email: email.toLowerCase().trim(), expiresAt, ipAddress, userAgent });
    await session.save();
    return session;
  }

  async getSessionById(sessionId: string) {
    const session = await SessionModel.findOne({ sessionId }).exec();
    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await SessionModel.deleteOne({ _id: session._id }).exec();
      return null;
    }
    return session;
  }

  async deleteSession(sessionId: string) {
    const result = await SessionModel.deleteOne({ sessionId }).exec();
    return result.deletedCount && result.deletedCount > 0;
  }

  async deleteAllSessionsByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    await SessionModel.deleteMany({ email: normalized }).exec();
  }

  async cleanupExpiredRecords() {
    const now = new Date();
    await OTPModel.deleteMany({ expiresAt: { $lt: now } }).exec();
    await SessionModel.deleteMany({ expiresAt: { $lt: now } }).exec();
  }

  async getStats() {
    const totalUsers = await UserModel.countDocuments().exec();
    const activeOTPs = await OTPModel.countDocuments().exec();
    const activeSessions = await SessionModel.countDocuments().exec();
    return { totalUsers, activeOTPs, activeSessions };
  }
}

export default new MongoStore();
