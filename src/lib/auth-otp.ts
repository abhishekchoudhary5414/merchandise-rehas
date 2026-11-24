import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * Generate cryptographically secure 6-digit numeric OTP
 */
export function generateNumericOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

/**
 * Create and send OTP for Password Reset or Verification
 * OTP is stored in hashed form in Neon DB using bcrypt
 */
export async function sendPasswordResetOTP(email: string) {
  const cleanEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    throw new Error('No account found with this email address');
  }

  // Generate 6-digit numeric OTP
  const rawOtpCode = generateNumericOTP(6);
  // OTP valid for 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Invalidate any active previous password reset OTPs for this email
  await prisma.userOtp.updateMany({
    where: {
      email: cleanEmail,
      purpose: 'PASSWORD_RESET',
      isUsed: false,
    },
    data: {
      isUsed: true,
    },
  });

  // Hash the OTP with bcrypt before saving to Neon DB for security
  const hashedOtp = await bcrypt.hash(rawOtpCode, 10);

  // Save hashed OTP in user_otps table
  await prisma.userOtp.create({
    data: {
      userId: user.id,
      email: cleanEmail,
      otpCode: hashedOtp, // Stored in hash form
      purpose: 'PASSWORD_RESET',
      expiresAt,
    },
  });

  // Send branded email via SMTP with the plain 6-digit code
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #EADBEE; border-radius: 14px; overflow: hidden;">
      <div style="background: #560067; padding: 25px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 1.5px;">REHAS</h1>
        <p style="margin: 4px 0 0; color: #D8B878; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Sacred Energy & Astrology Merchandise</p>
      </div>
      <div style="padding: 30px 25px; color: #390044; line-height: 1.6;">
        <h2 style="color: #560067; font-size: 19px; margin-top: 0;">Password Reset Verification</h2>
        <p>Hari Om, ${user.name}!</p>
        <p>A password reset request was initiated for your REHAS account. Use the one-time verification code below to reset your password:</p>
        
        <div style="background: #FAF4FC; border: 1.5px dashed #560067; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #560067;">${rawOtpCode}</span>
          <p style="margin: 8px 0 0; font-size: 12px; color: #7A6680;">Valid for 15 minutes. Never share this code with anyone.</p>
        </div>

        <p style="font-size: 13px; color: #7A6680;">If you did not request this, please secure your account or disregard this email.</p>
      </div>
      <div style="background: #FAF7FB; padding: 15px 25px; border-top: 1px solid #F0E6F2; text-align: center; font-size: 11.5px; color: #8D7A92;">
        © ${new Date().getFullYear()} REHAS Sacred Merchandise. All rights reserved.
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"REHAS Security" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: cleanEmail,
    subject: 'REHAS - Password Reset Verification Code',
    text: `Your REHAS password reset code is ${rawOtpCode}. It expires in 15 minutes.`,
    html,
  });

  return { success: true, email: cleanEmail };
}

/**
 * Verify OTP and Reset Password
 * Compares the entered plain OTP against the hashed OTP in Neon DB
 */
export async function verifyOTPAndResetPassword({
  email,
  otpCode,
  newPassword,
}: {
  email: string;
  otpCode: string;
  newPassword: string;
}) {
  const cleanEmail = email.trim().toLowerCase();

  const otpRecord = await prisma.userOtp.findFirst({
    where: {
      email: cleanEmail,
      purpose: 'PASSWORD_RESET',
      isUsed: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    throw new Error('No active OTP request found. Please request a new OTP.');
  }

  // Check if expired
  if (new Date() > otpRecord.expiresAt) {
    await prisma.userOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    throw new Error('OTP has expired. Please request a new OTP.');
  }

  // Check max attempts
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    await prisma.userOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    throw new Error('Too many invalid attempts. Please request a new OTP.');
  }

  // Compare entered OTP with hashed OTP in database
  // Supports both bcrypt hash and legacy plain text fallback
  const isMatch = otpRecord.otpCode.startsWith('$2')
    ? await bcrypt.compare(otpCode.trim(), otpRecord.otpCode)
    : otpRecord.otpCode === otpCode.trim();

  if (!isMatch) {
    await prisma.userOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error('Invalid verification code. Please check and try again.');
  }

  // Validate new password
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Hash new password with bcrypt
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // Mark OTP as used
  await prisma.userOtp.update({
    where: { id: otpRecord.id },
    data: {
      isUsed: true,
      usedAt: new Date(),
    },
  });

  // Update user password and timestamp in DB
  await prisma.user.update({
    where: { email: cleanEmail },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
    },
  });

  // Invalidate any active sessions
  if (otpRecord.userId) {
    await prisma.authSession.updateMany({
      where: { userId: otpRecord.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  return { success: true };
}

/**
 * Direct change password for authenticated users
 */
export async function changeUserPassword({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
    },
  });

  await prisma.authSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return { success: true };
}
