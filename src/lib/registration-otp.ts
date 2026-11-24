import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export function generateNumericOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

function getMailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Send OTP for Account Registration
 */
export async function sendRegistrationOTP(email: string, name?: string) {
  const cleanEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });
  if (existing) {
    throw new Error('An account with this email already exists. Please sign in.');
  }

  const rawOtpCode = generateNumericOTP(6);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Invalidate any previous registration OTPs for this email
  await prisma.userOtp.updateMany({
    where: {
      email: cleanEmail,
      purpose: 'REGISTRATION',
      isUsed: false,
    },
    data: {
      isUsed: true,
    },
  });

  const hashedOtp = await bcrypt.hash(rawOtpCode, 10);

  await prisma.userOtp.create({
    data: {
      email: cleanEmail,
      otpCode: hashedOtp,
      purpose: 'REGISTRATION',
      expiresAt,
    },
  });

  const transporter = getMailTransporter();
  const userName = name?.trim() || 'Sacred Seeker';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #EADBEE; border-radius: 14px; overflow: hidden;">
      <div style="background: #560067; padding: 25px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 1.5px;">REHAS</h1>
        <p style="margin: 4px 0 0; color: #D8B878; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Sacred Energy & Astrology Merchandise</p>
      </div>
      <div style="padding: 30px 25px; color: #390044; line-height: 1.6;">
        <h2 style="color: #560067; font-size: 19px; margin-top: 0;">Verify Your REHAS Account</h2>
        <p>Hari Om, ${userName}!</p>
        <p>Thank you for choosing REHAS Sacred Merchandise. Use the verification OTP below to complete creating your account:</p>
        
        <div style="background: #FAF4FC; border: 1.5px dashed #560067; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #560067;">${rawOtpCode}</span>
          <p style="margin: 8px 0 0; font-size: 12px; color: #7A6680;">Valid for 15 minutes. Never share this code with anyone.</p>
        </div>

        <p style="font-size: 13px; color: #7A6680;">If you did not request this account creation, please ignore this email.</p>
      </div>
      <div style="background: #FAF7FB; padding: 15px 25px; border-top: 1px solid #F0E6F2; text-align: center; font-size: 11.5px; color: #8D7A92;">
        © ${new Date().getFullYear()} REHAS Sacred Merchandise. All rights reserved.
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"REHAS Security" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: cleanEmail,
    subject: `${rawOtpCode} is your REHAS Account Verification Code`,
    text: `Your REHAS registration code is ${rawOtpCode}. It expires in 15 minutes.`,
    html,
  });

  return { success: true, email: cleanEmail };
}

/**
 * Verify Registration OTP
 */
export async function verifyRegistrationOTP({
  email,
  otpCode,
}: {
  email: string;
  otpCode: string;
}) {
  const cleanEmail = email.trim().toLowerCase();

  const otpRecord = await prisma.userOtp.findFirst({
    where: {
      email: cleanEmail,
      purpose: 'REGISTRATION',
      isUsed: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    throw new Error('No active registration OTP found. Please request a new code.');
  }

  if (new Date() > otpRecord.expiresAt) {
    await prisma.userOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    throw new Error('OTP has expired. Please request a new code.');
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    await prisma.userOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    throw new Error('Too many invalid attempts. Please request a new OTP.');
  }

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

  // Mark OTP as used
  await prisma.userOtp.update({
    where: { id: otpRecord.id },
    data: {
      isUsed: true,
      usedAt: new Date(),
    },
  });

  return { verified: true, email: cleanEmail };
}
