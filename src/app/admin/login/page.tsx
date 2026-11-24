'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Material UI Icons exclusively
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

import siteConfig from '@/data/site-config.json';
import styles from './AdminLogin.module.css';

type AuthView = 'LOGIN' | 'FORGOT_REQUEST' | 'FORGOT_VERIFY';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [view, setView] = useState<AuthView>('LOGIN');

  // Credentials
  const [email, setEmail] = useState('merchandise.rehas@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password OTP states
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Regular Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Request OTP for Password Reset
  async function handleRequestOTP(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccessMessage(data.message || `Verification code sent to ${email}`);
      setView('FORGOT_VERIFY');
    } catch (err: any) {
      setError(err.message || 'Could not send reset code. Please check email address.');
    } finally {
      setIsLoading(false);
    }
  }

  // 3. Verify OTP & Reset Password
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otpCode: otpCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccessMessage('Password successfully updated! You can now log in.');
      setPassword('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setView('LOGIN');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.loginCard}>
      {/* Card Header with Brand Logo */}
      <div className={styles.cardHeader}>
        <div className={styles.logoWrap}>
          <Image
            src={siteConfig.brand.logo}
            alt="REHAS Brand Emblem"
            width={54}
            height={54}
            className={styles.logoImg}
            priority
          />
        </div>
        <h1 className={styles.brandTitle}>{siteConfig.brand.name}</h1>
        <p className={styles.adminSubtitle}>
          <SecurityIcon fontSize="inherit" className={styles.shieldIcon} />
          {view === 'LOGIN' && 'Administrative Command Portal'}
          {view === 'FORGOT_REQUEST' && 'Admin Password Recovery'}
          {view === 'FORGOT_VERIFY' && 'Verify OTP & Set New Password'}
        </p>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <ErrorOutlinedIcon fontSize="small" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className={styles.successAlert}>
          <CheckCircleOutlinedIcon fontSize="small" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* VIEW 1: Standard Login Form */}
      {view === 'LOGIN' && (
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Admin Email Address</label>
            <div className={styles.inputWrapper}>
              <EmailOutlinedIcon className={styles.inputIcon} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchandise.rehas@gmail.com"
                className={styles.inputField}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Admin Password</label>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setView('FORGOT_REQUEST');
                }}
                className={styles.forgotLink}
              >
                Forgot Password?
              </button>
            </div>
            <div className={styles.inputWrapper}>
              <LockOutlinedIcon className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={styles.inputField}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggleBtn}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon fontSize="small" />
                ) : (
                  <VisibilityOutlinedIcon fontSize="small" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Authenticate & Enter</span>
                <ArrowForwardIcon fontSize="small" />
              </>
            )}
          </button>
        </form>
      )}

      {/* VIEW 2: Request Password Reset OTP */}
      {view === 'FORGOT_REQUEST' && (
        <form onSubmit={handleRequestOTP} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirm Admin Email</label>
            <div className={styles.inputWrapper}>
              <EmailOutlinedIcon className={styles.inputIcon} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchandise.rehas@gmail.com"
                className={styles.inputField}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? (
              <span>Generating Secure OTP...</span>
            ) : (
              <>
                <span>Send Reset Code</span>
                <ArrowForwardIcon fontSize="small" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              setView('LOGIN');
            }}
            className={styles.secondaryBtn}
          >
            <ArrowBackIcon fontSize="small" /> Back to Login
          </button>
        </form>
      )}

      {/* VIEW 3: Verify OTP & Enter New Password */}
      {view === 'FORGOT_VERIFY' && (
        <form onSubmit={handleResetPassword} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Enter 6-Digit OTP Code</label>
            <div className={styles.inputWrapper}>
              <VpnKeyOutlinedIcon className={styles.inputIcon} />
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className={`${styles.inputField} ${styles.otpInput}`}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>New Password</label>
            <div className={styles.inputWrapper}>
              <LockOutlinedIcon className={styles.inputIcon} />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className={styles.inputField}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={styles.passwordToggleBtn}
                title={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? (
                  <VisibilityOffOutlinedIcon fontSize="small" />
                ) : (
                  <VisibilityOutlinedIcon fontSize="small" />
                )}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirm New Password</label>
            <div className={styles.inputWrapper}>
              <LockOutlinedIcon className={styles.inputIcon} />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={styles.inputField}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? (
              <span>Verifying & Resetting...</span>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowForwardIcon fontSize="small" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              setView('FORGOT_REQUEST');
            }}
            className={styles.secondaryBtn}
          >
            <ArrowBackIcon fontSize="small" /> Resend OTP Code
          </button>
        </form>
      )}

      <div className={styles.footerNote}>
        <p>Restricted Area. Authorized administrative personnel only.</p>
        <Link href="/" className={styles.backStoreLink}>
          ← Return to Storefront
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className={styles.loginPageRoot}>
      {/* Background Spiritual Aura & Watermarks */}
      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.orbOne} />
        <div className={styles.orbTwo} />
      </div>

      <Suspense fallback={<div className={styles.loginCard}><p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
