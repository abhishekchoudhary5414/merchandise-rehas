'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  ShoppingBag,
  Heart,
  Truck,
  LogOut,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import siteConfig from '@/data/site-config.json';
import styles from './AuthPage.module.css';

type Mode = 'LOGIN' | 'REGISTER' | 'FORGOT_REQUEST' | 'FORGOT_VERIFY';

function CustomerAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const redirectTo = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/account';
  const tabParam = searchParams.get('tab');
  const [mode, setMode] = useState<Mode>(tabParam === 'register' ? 'REGISTER' : 'LOGIN');
  const [user, setUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // OTP State for Registration
  const [registerOtp, setRegisterOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // OTP State for Forgot Password
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user);
        }
      } catch {
        // Ignore
      } finally {
        setCheckingSession(false);
      }
    }
    loadMe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign in failed');
      setUser(data.user);
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRegisterOtp() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }
    setError(null);
    setSuccess(null);
    setSendingOtp(true);
    try {
      const res = await fetch('/api/auth/register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
      setResendCountdown(60);
      setSuccess(data.message || 'Verification code sent to your email.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!otpSent) {
      setError('Please click "Send OTP" to receive verification code first.');
      return;
    }
    if (!registerOtp || registerOtp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both passwords.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          otpCode: registerOtp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setSuccess(data.message || `OTP sent to ${email}`);
      setMode('FORGOT_VERIFY');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: forgotOtp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setSuccess('Password updated successfully! You can now sign in.');
      setMode('LOGIN');
      setPassword('');
      setForgotOtp('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
      setUser(null);
      router.refresh();
    } catch {
      // Ignore
    }
  }

  return (
    <div className={styles.pageWrap}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        {checkingSession ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading your sanctuary...
          </div>
        ) : user ? (
          <div className={styles.loggedInCard}>
            <div className={styles.avatarCircle}>
              {user.name ? user.name[0].toUpperCase() : 'R'}
            </div>
            <h1 className={styles.formTitle} style={{ marginBottom: '4px' }}>
              Welcome back, {user.name}!
            </h1>
            <p className={styles.formSubtitle}>{user.email}</p>

            <div className={styles.userGrid}>
              <Link href="/cart" className={styles.userGridItem}>
                <ShoppingBag size={20} color="var(--primary)" />
                <span>My Cart</span>
              </Link>
              <Link href="/wishlist" className={styles.userGridItem}>
                <Heart size={20} color="var(--primary)" />
                <span>My Wishlist</span>
              </Link>
              <Link href="/track-order" className={styles.userGridItem}>
                <Truck size={20} color="var(--primary)" />
                <span>Track Orders</span>
              </Link>
              <Link href="/shop" className={styles.userGridItem}>
                <Sparkles size={20} color="var(--primary)" />
                <span>Sacred Store</span>
              </Link>
            </div>

            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={16} /> Sign Out of Account
            </button>
          </div>
        ) : (
          <div className={styles.authCard}>
            {/* Left Brand Panel */}
            <div className={styles.brandPanel}>
              <div>
                <div className={styles.logoRow}>
                  <div className={styles.brandLogoImgWrap}>
                    <Image
                      src={siteConfig.brand.logo}
                      alt={siteConfig.brand.name}
                      width={44}
                      height={44}
                      className={styles.brandLogoImg}
                    />
                  </div>
                  <div>
                    <div className={styles.brandName}>{siteConfig.brand.name}</div>
                    <div className={styles.brandSub}>{siteConfig.brand.subName}</div>
                  </div>
                </div>

                <h2 className={styles.panelHeading}>
                  {mode === 'REGISTER'
                    ? 'Join REHAS Circle'
                    : mode === 'LOGIN'
                    ? 'Sacred Sanctuary'
                    : 'Account Recovery'}
                </h2>
                <p className={styles.panelSub}>
                  {mode === 'REGISTER'
                    ? 'Create your account securely with email OTP verification. Unlock member privileges, instant discounts, and express checkout.'
                    : mode === 'LOGIN'
                    ? 'Sign in to access your consecrated orders, customized astrology energizations, and sacred wishlist.'
                    : 'Receive a secure one-time verification code on your registered email to reset your credentials.'}
                </p>

                <ul className={styles.perkList}>
                  <li className={styles.perkItem}>
                    <ShieldCheck size={18} className={styles.perkIcon} />
                    <span>Instant OTP email security check</span>
                  </li>
                  <li className={styles.perkItem}>
                    <Sparkles size={18} className={styles.perkIcon} />
                    <span>Special member coupons & discounts</span>
                  </li>
                  <li className={styles.perkItem}>
                    <Truck size={18} className={styles.perkIcon} />
                    <span>Fast pan-India doorstep dispatch</span>
                  </li>
                </ul>
              </div>

              <div className={styles.panelTrust}>
                <CheckCircle2 size={16} />
                <span>Govt. Lab Certified Gemstones · 100% Authentic Consecration</span>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className={styles.formPanel}>
              {mode !== 'FORGOT_REQUEST' && mode !== 'FORGOT_VERIFY' && (
                <div className={styles.tabs}>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${mode === 'LOGIN' ? styles.tabBtnActive : ''}`}
                    onClick={() => {
                      setMode('LOGIN');
                      setError(null);
                      setSuccess(null);
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className={`${styles.tabBtn} ${mode === 'REGISTER' ? styles.tabBtnActive : ''}`}
                    onClick={() => {
                      setMode('REGISTER');
                      setError(null);
                      setSuccess(null);
                    }}
                  >
                    Create Account (with OTP)
                  </button>
                </div>
              )}

              {error && <div className={styles.errorBox}>{error}</div>}
              {success && <div className={styles.successBox}>{success}</div>}

              {/* 1. SIGN IN FORM */}
              {mode === 'LOGIN' && (
                <form onSubmit={handleLogin} className={styles.form}>
                  <h2 className={styles.formTitle}>Welcome to REHAS</h2>
                  <p className={styles.formSubtitle}>
                    Enter your registered email and password to continue.
                  </p>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <div className={styles.inputWrap}>
                      <Mail size={16} className={styles.inputIcon} />
                      <input
                        type="email"
                        required
                        placeholder="e.g. priya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Password</label>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.inputIcon} />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className={styles.eyeBtn}
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('FORGOT_REQUEST');
                      setError(null);
                      setSuccess(null);
                    }}
                    className={styles.forgotLink}
                  >
                    Forgot Password?
                  </button>

                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* 2. REGISTRATION FORM WITH OTP */}
              {mode === 'REGISTER' && (
                <form onSubmit={handleRegister} className={styles.form}>
                  <h2 className={styles.formTitle}>Create Account with OTP</h2>
                  <p className={styles.formSubtitle}>
                    Fast and verified account creation for sacred seekers.
                  </p>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Full Name *</label>
                    <div className={styles.inputWrap}>
                      <UserIcon size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address (Receives OTP) *</label>
                    <div className={styles.inputWrap}>
                      <Mail size={16} className={styles.inputIcon} />
                      <input
                        type="email"
                        required
                        placeholder="priya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Verification OTP *</label>
                    <div className={styles.otpRow}>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6-DIGIT OTP"
                        value={registerOtp}
                        onChange={(e) => setRegisterOtp(e.target.value.replace(/\D/g, ''))}
                        className={styles.otpInput}
                      />
                      <button
                        type="button"
                        onClick={handleSendRegisterOtp}
                        disabled={sendingOtp || !email || resendCountdown > 0}
                        className={styles.sendOtpBtn}
                      >
                        {sendingOtp
                          ? 'Sending...'
                          : resendCountdown > 0
                          ? `Resend in ${resendCountdown}s`
                          : otpSent
                          ? 'Resend OTP'
                          : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Mobile Number (Optional)</label>
                    <div className={styles.inputWrap}>
                      <Phone size={16} className={styles.inputIcon} />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit Indian mobile (e.g. 9876543210)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Create Password (Min 6 chars) *</label>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.inputIcon} />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className={styles.eyeBtn}
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Confirm Password *</label>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.inputIcon} />
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.input}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd((v) => !v)}
                        className={styles.eyeBtn}
                      >
                        {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'Creating Account...' : 'Verify OTP & Create Account'}
                  </button>
                </form>
              )}

              {/* 3. FORGOT PASSWORD REQUEST */}
              {mode === 'FORGOT_REQUEST' && (
                <form onSubmit={handleForgotRequest} className={styles.form}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      setError(null);
                      setSuccess(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      padding: 0,
                      marginBottom: '0.5rem',
                    }}
                  >
                    <ArrowLeft size={16} /> Back to Sign In
                  </button>

                  <h2 className={styles.formTitle}>Reset Password</h2>
                  <p className={styles.formSubtitle}>
                    Enter your registered email address to receive a 6-digit verification code.
                  </p>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Registered Email Address</label>
                    <div className={styles.inputWrap}>
                      <Mail size={16} className={styles.inputIcon} />
                      <input
                        type="email"
                        required
                        placeholder="e.g. priya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'Sending Verification OTP...' : 'Send Password Reset Code'}
                  </button>
                </form>
              )}

              {/* 4. FORGOT PASSWORD VERIFY */}
              {mode === 'FORGOT_VERIFY' && (
                <form onSubmit={handleForgotReset} className={styles.form}>
                  <h2 className={styles.formTitle}>Enter Verification Code</h2>
                  <p className={styles.formSubtitle}>
                    We sent a 6-digit OTP code to <strong>{email}</strong>.
                  </p>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>6-Digit OTP Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      className={styles.otpInput}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>New Password (Min 6 chars)</label>
                    <div className={styles.inputWrap}>
                      <Lock size={16} className={styles.inputIcon} />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={styles.input}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className={styles.eyeBtn}
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'Updating Password...' : 'Verify & Set New Password'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('FORGOT_REQUEST');
                      setError(null);
                      setSuccess(null);
                    }}
                    className={styles.forgotLink}
                    style={{ textAlign: 'center', marginTop: '0.5rem', alignSelf: 'center' }}
                  >
                    Change Email / Resend Code
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--background)' }} />}>
      <CustomerAuthPage />
    </Suspense>
  );
}
