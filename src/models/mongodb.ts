/**
 * MongoDB Database Models (for production use)
 * This is a placeholder for actual MongoDB implementation
 * 
 * To use MongoDB instead of in-memory storage:
 * 1. npm install mongoose
 * 2. Update config to use MongoDB URI
 * 3. Replace store.ts imports with these models
 * 4. Update controllers to use async database calls
 */

// import mongoose from 'mongoose';

// User Schema
/*
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
});

export const User = mongoose.model('User', userSchema);
*/

// OTP Record Schema
/*
const otpSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Auto-delete after 10 minutes
  },
  expiresAt: Date,
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 5,
  },
});

// Index for faster lookups
otpSchema.index({ email: 1, expiresAt: 1 });

export const OTPRecord = mongoose.model('OTPRecord', otpSchema);
*/

// Session Schema
/*
const sessionSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  sessionId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }, // Auto-delete expired
  },
  ipAddress: String,
  userAgent: String,
});

// Index for faster lookups
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ userId: 1 });

export const Session = mongoose.model('Session', sessionSchema);
*/

export {};
