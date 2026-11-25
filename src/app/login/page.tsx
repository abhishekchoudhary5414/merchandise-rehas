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
  const tabParam = searchParams.get('tab');
  const redirectParam = searchParams.get('redirect');
  const [mode, setMode] = useState<Mode>(tabParam === 'register' ? 'REGISTER' : 'LOGIN');
  const [user, setUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Determine safe redirect destination
  // If user is registering, always land directly on their /account page unless explicitly specified
  const getRedirectUrl = (currentMode: Mode) => {
    if (redirectParam && redirectParam.startsWith('/')) {
      return redirectParam;
    }
    return '/account';
  };

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // OTP State for Registration
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
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
      router.push(getRedirectUrl('LOGIN'));
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRegisterOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!name || !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (phone && phone.trim().length > 0 && phone.trim().length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
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
      setSuccess(data.message || `Verification code sent to ${email}`);
      setRegisterStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  }

  function handleVerifyOtpStep(e: React.FormEvent) {
    e.preventDefault();
    if (!registerOtp || registerOtp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    setError(null);
    setSuccess('OTP entered. Please create a secure password to complete your account.');
    setRegisterStep(3);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!registerOtp || registerOtp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code sent to your email.');
      setRegisterStep(2);
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
      // Successful account creation ALWAYS redirects to /account
      router.push('/account');
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
                    ? (
                      <>
                        Create Your <br />
                        <span className={styles.goldAccent}>Sacred Account</span>
                      </>
                    )
                    : mode === 'LOGIN'
                    ? (
                      <>
                        Welcome to <br />
                        <span className={styles.goldAccent}>Sacred Sanctuary</span>
                      </>
                    )
                    : 'Account Recovery'}
                </h2>
                <p className={styles.panelSub}>
                  {mode === 'REGISTER'
                    ? 'Begin your energized gemstone journey. Create your verified patron account to unlock Vedic energization rituals, member privileges, and express pan-India dispatch.'
                    : mode === 'LOGIN'
                    ? 'Sign in to access your consecrated orders, customized astrology energizations, and sacred wishlist.'
                    : 'Receive a secure one-time verification code on your registered email to reset your credentials.'}
                </p>

                <ul className={styles.perkList}>
                  <li className={styles.perkItem}>
                    <div className={styles.perkIconWrap}>
                      <ShieldCheck size={18} />
                    </div>
                    <span>Instant OTP email verification check</span>
                  </li>
                  <li className={styles.perkItem}>
                    <div className={styles.perkIconWrap}>
                      <Sparkles size={18} />
                    </div>
                    <span>Exclusive patron coupons & discounts</span>
                  </li>
                  <li className={styles.perkItem}>
                    <div className={styles.perkIconWrap}>
                      <Truck size={18} />
                    </div>
                    <span>Doorstep express dispatch across India</span>
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

              {/* 2. REGISTRATION FORM DIVIDED INTO 3 DISTINCT SECTIONS */}
              {mode === 'REGISTER' && (
                <div className={styles.form}>
                  <div className={styles.formHeader}>
                    <span className={styles.formTag}>
                      <Sparkles size={12} /> REHAS Consecrated Boutique
                    </span>
                    <h2 className={styles.formTitle}>Create Sacred Account</h2>
                    <p className={styles.formSubtitle}>
                      {registerStep === 1
                        ? 'Step 1 of 3: Provide your contact credentials'
                        : registerStep === 2
                        ? 'Step 2 of 3: Verify the one-time code sent to your email'
                        : 'Step 3 of 3: Set your personal account password'}
                    </p>
                  </div>

                  {/* 3-Step Visual Progress Stepper */}
                  <div className={styles.stepper}>
                    <div
                      className={`${styles.stepItem} ${
                        registerStep === 1
                          ? styles.stepActive
                          : registerStep > 1
                          ? styles.stepCompleted
                          : ''
                      }`}
                    >
                      <div className={styles.stepBadge}>
                        {registerStep > 1 ? <CheckCircle2 size={16} /> : '1'}
                      </div>
                      <span className={styles.stepLabel}>1. Details</span>
                    </div>

                    <div
                      className={`${styles.stepLine} ${
                        registerStep > 1 ? styles.stepLineActive : ''
                      }`}
                    />

                    <div
                      className={`${styles.stepItem} ${
                        registerStep === 2
                          ? styles.stepActive
                          : registerStep > 2
                          ? styles.stepCompleted
                          : ''
                      }`}
                    >
                      <div className={styles.stepBadge}>
                        {registerStep > 2 ? <CheckCircle2 size={16} /> : '2'}
                      </div>
                      <span className={styles.stepLabel}>2. Verify OTP</span>
                    </div>

                    <div
                      className={`${styles.stepLine} ${
                        registerStep > 2 ? styles.stepLineActive : ''
                      }`}
                    />

                    <div
                      className={`${styles.stepItem} ${
                        registerStep === 3 ? styles.stepActive : ''
                      }`}
                    >
                      <div className={styles.stepBadge}>3</div>
                      <span className={styles.stepLabel}>3. Password</span>
                    </div>
                  </div>

                  {/* SECTION 1: NAME, EMAIL, PHONE */}
                  {registerStep === 1 && (
                    <form onSubmit={handleSendRegisterOtp} className={styles.form}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>
                          <span>Full Name *</span>
                        </label>
                        <div className={styles.inputWrap}>
                          <UserIcon size={18} className={styles.inputIcon} />
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
                        <label className={styles.label}>
                          <span>Email Address (Receives OTP) *</span>
                        </label>
                        <div className={styles.inputWrap}>
                          <Mail size={18} className={styles.inputIcon} />
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
                        <label className={styles.label}>
                          <span>Mobile Number</span>
                          <span className={styles.optionalTag}>(Optional)</span>
                        </label>
                        <div className={styles.inputWrap}>
                          <Phone size={18} className={styles.inputIcon} />
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

                      <button
                        type="submit"
                        disabled={sendingOtp || !email || !name}
                        className={styles.submitBtn}
                        style={{ marginTop: '0.5rem', padding: '0.95rem 1.5rem' }}
                      >
                        {sendingOtp ? 'Sending Verification OTP...' : 'Continue to OTP Verification'} <ArrowRight size={16} />
                      </button>
                    </form>
                  )}

                  {/* SECTION 2: OTP VERIFICATION */}
                  {registerStep === 2 && (
                    <form onSubmit={handleVerifyOtpStep}>
                      <div className={styles.otpHintBox}>
                        <span>
                          We sent a 6-digit verification code to <strong>{email}</strong>
                        </span>
                        <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                          Please enter the code to confirm your email address.
                        </span>
                      </div>

                      <div className={styles.inputGroup} style={{ marginTop: '0.75rem' }}>
                        <label className={styles.label}>Enter 6-Digit OTP *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="••••••"
                          value={registerOtp}
                          onChange={(e) => setRegisterOtp(e.target.value.replace(/\D/g, ''))}
                          className={styles.otpInputBig}
                          autoFocus
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => handleSendRegisterOtp()}
                          disabled={sendingOtp || resendCountdown > 0}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: resendCountdown > 0 ? 'var(--text-secondary)' : 'var(--primary)',
                            fontSize: '0.825rem',
                            fontWeight: 700,
                            cursor: resendCountdown > 0 ? 'default' : 'pointer',
                            padding: '4px 0',
                          }}
                        >
                          {sendingOtp
                            ? 'Sending...'
                            : resendCountdown > 0
                            ? `Resend OTP in ${resendCountdown}s`
                            : 'Resend OTP'}
                        </button>
                      </div>

                      <div className={styles.stepButtonRow}>
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            setSuccess(null);
                            setRegisterStep(1);
                          }}
                          className={styles.backStepBtn}
                        >
                          <ArrowLeft size={15} /> Edit Info
                        </button>

                        <button
                          type="submit"
                          disabled={registerOtp.length !== 6}
                          className={styles.submitBtn}
                          style={{ flex: 1, marginTop: 0 }}
                        >
                          Verify & Set Password <ArrowRight size={16} />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* SECTION 3: CREATE & CONFIRM PASSWORD */}
                  {registerStep === 3 && (
                    <form onSubmit={handleRegister}>
                      <div className={styles.otpHintBox} style={{ background: '#ECFDF5', borderColor: '#A7F3D0', color: '#065F46' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                          <CheckCircle2 size={16} color="#047857" /> Email Verified ({email})
                        </span>
                        <span style={{ fontSize: '0.775rem' }}>
                          Now choose a secure password to finalize your account.
                        </span>
                      </div>

                      <div className={styles.inputGroup} style={{ marginTop: '0.75rem' }}>
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
                            autoFocus
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

                      <div className={styles.stepButtonRow}>
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            setSuccess(null);
                            setRegisterStep(2);
                          }}
                          className={styles.backStepBtn}
                        >
                          <ArrowLeft size={15} /> Back
                        </button>

                        <button
                          type="submit"
                          disabled={loading || password.length < 6 || password !== confirmPassword}
                          className={styles.submitBtn}
                          style={{ flex: 1, marginTop: 0 }}
                        >
                          {loading ? 'Finalizing Account...' : 'Create Account & Sign In'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
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
