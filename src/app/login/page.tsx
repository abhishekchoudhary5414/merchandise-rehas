'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
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
} from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import siteConfig from '@/data/site-config.json';
import styles from './AuthPage.module.css';

type Mode = 'LOGIN' | 'REGISTER' | 'FORGOT_REQUEST' | 'FORGOT_VERIFY';

export default function CustomerAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('LOGIN');
  const [user, setUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // OTP reset
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      router.push('/shop');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
      router.push('/shop');
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
        body: JSON.stringify({ email, otpCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setSuccess('Password reset successfully! You can now sign in.');
      setOtpCode('');
      setNewPassword('');
      setMode('LOGIN');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/me', { method: 'DELETE' });
    setUser(null);
    setSuccess('Signed out successfully.');
  }

  return (
    <div className={styles.pageWrap}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        <div className={styles.authCard}>
          {/* Left Showcase Panel */}
          <div className={styles.brandPanel}>
            <div>
              <div className={styles.logoRow}>
                <Image
                  src={siteConfig.brand.logo}
                  alt="REHAS Logo"
                  width={42}
                  height={42}
                  style={{ objectFit: 'contain' }}
                />
                <span className={styles.brandName}>REHAS</span>
              </div>

              <h1 className={styles.panelHeading}>
                {user
                  ? `Hari Om, ${user.name}!`
                  : mode === 'REGISTER'
                  ? "Looks like you're new here!"
                  : mode === 'LOGIN'
                  ? 'Welcome back!'
                  : 'Recover your account'}
              </h1>
              <p className={styles.panelSub}>
                {user
                  ? 'Manage your saved sacred merchandise, wishlist, and order tracking from one place.'
                  : mode === 'REGISTER'
                  ? 'Create your REHAS account to unlock faster checkout, saved wishlist, and order tracking.'
                  : 'Sign in to access your Orders, Wishlist, and personalized recommendations.'}
              </p>
            </div>

            <ul className={styles.perkList}>
              <li className={styles.perkItem}>
                <CheckCircle2 size={16} color="var(--secondary)" />
                <span>Track your consecrated orders in real time</span>
              </li>
              <li className={styles.perkItem}>
                <CheckCircle2 size={16} color="var(--secondary)" />
                <span>Save favorite crystals &amp; merchandise to Wishlist</span>
              </li>
              <li className={styles.perkItem}>
                <CheckCircle2 size={16} color="var(--secondary)" />
                <span>Fast Razorpay &amp; Cash on Delivery checkout</span>
              </li>
            </ul>
          </div>

          {/* Right Form / Account Panel */}
          <div className={styles.formPanel}>
            {checkingSession ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Checking session...</p>
            ) : user ? (
              <div className={styles.profileBox}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', margin: '0 0 0.25rem' }}>
                    {user.name}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {user.email} {user.phone ? `· ${user.phone}` : ''}
                  </p>
                </div>

                <div className={styles.quickLinks}>
                  <Link href="/cart" className={styles.quickLink}>
                    <ShoppingBag size={18} />
                    <span>My Cart</span>
                  </Link>
                  <Link href="/wishlist" className={styles.quickLink}>
                    <Heart size={18} />
                    <span>My Wishlist</span>
                  </Link>
                  <Link href="/track-order" className={styles.quickLink}>
                    <Truck size={18} />
                    <span>Track Orders</span>
                  </Link>
                  <Link href="/shop" className={styles.quickLink}>
                    <ArrowRight size={18} />
                    <span>Browse Shop</span>
                  </Link>
                </div>

                <button type="button" onClick={handleLogout} className={styles.secondaryBtn}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                {(mode === 'LOGIN' || mode === 'REGISTER') && (
                  <div className={styles.tabBar}>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccess(null);
                        setMode('LOGIN');
                      }}
                      className={`${styles.tabBtn} ${mode === 'LOGIN' ? styles.tabBtnActive : ''}`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccess(null);
                        setMode('REGISTER');
                      }}
                      className={`${styles.tabBtn} ${mode === 'REGISTER' ? styles.tabBtnActive : ''}`}
                    >
                      Create Account
                    </button>
                  </div>
                )}

                {error && <div className={styles.alertError}>{error}</div>}
                {success && <div className={styles.alertSuccess}>{success}</div>}

                {mode === 'LOGIN' && (
                  <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Email Address</label>
                      <div className={styles.inputWrap}>
                        <Mail size={16} className={styles.inputIcon} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <div className={styles.labelRow}>
                        <label className={styles.label}>Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            setSuccess(null);
                            setMode('FORGOT_REQUEST');
                          }}
                          className={styles.linkBtn}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className={styles.inputWrap}>
                        <Lock size={16} className={styles.inputIcon} />
                        <input
                          type={showPwd ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          className={styles.eyeBtn}
                          aria-label={showPwd ? 'Hide password' : 'Show password'}
                        >
                          {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                      <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                      <ArrowRight size={16} />
                    </button>

                    <p className={styles.termsNote}>
                      By continuing, you agree to REHAS Sacred Merchandise&apos;s{' '}
                      <Link href="/shipping-policy" style={{ color: 'var(--primary)' }}>
                        Shipping Policy
                      </Link>{' '}
                      and{' '}
                      <Link href="/returns-refunds" style={{ color: 'var(--primary)' }}>
                        Returns Policy
                      </Link>
                      .
                    </p>
                  </form>
                )}

                {mode === 'REGISTER' && (
                  <form onSubmit={handleRegister} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Full Name *</label>
                      <div className={styles.inputWrap}>
                        <User size={16} className={styles.inputIcon} />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Email Address *</label>
                      <div className={styles.inputWrap}>
                        <Mail size={16} className={styles.inputIcon} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Mobile Number</label>
                      <div className={styles.inputWrap}>
                        <Phone size={16} className={styles.inputIcon} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Password *</label>
                      <div className={styles.inputWrap}>
                        <Lock size={16} className={styles.inputIcon} />
                        <input
                          type={showPwd ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          className={styles.eyeBtn}
                          aria-label={showPwd ? 'Hide password' : 'Show password'}
                        >
                          {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                      <span>{loading ? 'Creating Account...' : 'Create Your REHAS Account'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}

                {mode === 'FORGOT_REQUEST' && (
                  <form onSubmit={handleForgotRequest} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Registered Email Address</label>
                      <div className={styles.inputWrap}>
                        <Mail size={16} className={styles.inputIcon} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                      <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('LOGIN')}
                      className={styles.secondaryBtn}
                    >
                      <ArrowLeft size={15} /> Back to Sign In
                    </button>
                  </form>
                )}

                {mode === 'FORGOT_VERIFY' && (
                  <form onSubmit={handleForgotReset} className={styles.form}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>6-Digit OTP Code</label>
                      <div className={styles.inputWrap}>
                        <KeyRound size={16} className={styles.inputIcon} />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>New Password</label>
                      <div className={styles.inputWrap}>
                        <Lock size={16} className={styles.inputIcon} />
                        <input
                          type={showPwd ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          className={styles.eyeBtn}
                        >
                          {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                      <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('LOGIN')}
                      className={styles.secondaryBtn}
                    >
                      <ArrowLeft size={15} /> Back to Sign In
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
