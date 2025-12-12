/**
 * Simple email service for sending OTPs
 * In production, integrate with actual email providers (SendGrid, AWS SES, Nodemailer, etc.)
 */

import nodemailer from 'nodemailer';
import config from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Initialize transporter if SMTP is configured
    const { smtp } = config;
    if (smtp && smtp.user && smtp.password) {
      try {
        this.transporter = nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          secure: smtp.port === 465, // true for 465, false for other ports
          auth: {
            user: smtp.user,
            pass: smtp.password,
          },
        });
      } catch (err) {
        console.warn('⚠️ Failed to create Nodemailer transporter, falling back to console logging', err);
        this.transporter = null;
      }
    }
  }

  /**
   * Send email using configured transporter or fallback to console.log
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: config.smtp.from || process.env.SMTP_FROM || 'noreply@secureauth.com',
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });

        console.log('📧 Email sent via SMTP:', { to: options.to, subject: options.subject });
        return true;
      }

      // Fallback for development: log OTP to console
      console.log('📧 [DEV] Email (logged):', {
        to: options.to,
        subject: options.subject,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email: string, otp: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; border: 2px solid #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 4px; font-family: 'Courier New', monospace; }
            .note { color: #666; font-size: 12px; margin-top: 20px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SecureAuth</h1>
              <p>Email Verification</p>
            </div>
            <div class="content">
              <h2>Verify Your Email</h2>
              <p>Hello,</p>
              <p>You requested to verify your email address. Please use the following One-Time Password (OTP) to complete your authentication:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>

              <p><strong>Important Security Notes:</strong></p>
              <ul>
                <li>This OTP is valid for 10 minutes</li>
                <li>Never share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>

              <div class="note">
                <p>Questions? Contact our support team</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2025 SecureAuth. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Your SecureAuth OTP: ${otp}\n\nValid for 10 minutes. Do not share with anyone.`;

    return this.sendEmail({
      to: email,
      subject: `Your SecureAuth OTP: ${otp}`,
      html,
      text,
    });
  }

  /**
   * Send session created confirmation email
   */
  async sendSessionConfirmationEmail(email: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .success-icon { font-size: 48px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SecureAuth</h1>
              <p>Session Created</p>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2>Session Created Successfully</h2>
              <p>Hello,</p>
              <p>Your session has been created successfully. You're now authenticated.</p>
              
              <p><strong>Session Details:</strong></p>
              <ul>
                <li>Email: ${email}</li>
                <li>Created at: ${new Date().toLocaleString()}</li>
                <li>Session duration: 24 hours</li>
              </ul>

              <p>If you did not create this session, please contact us immediately.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 SecureAuth. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Session Created - SecureAuth',
      html,
    });
  }
}

export const emailService = new EmailService();
