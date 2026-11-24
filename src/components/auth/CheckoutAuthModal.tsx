'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Tag,
} from 'lucide-react';
import styles from './CheckoutAuthModal.module.css';

export interface CouponOffer {
  code: string;
  discountPct: number;
  minOrderValue: number;
  maxDiscount: number | null;
}

interface CheckoutAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (user: any, autoCouponCode: string | null) => void;
  initialTab?: 'REGISTER' | 'LOGIN';
  offer?: CouponOffer | null;
}

export default function CheckoutAuthModal({
  open,
  onClose,
  onSuccess,
  initialTab = 'REGISTER',
  offer: propOffer,
}: CheckoutAuthModalProps) {
  const [tab, setTab] = useState<'REGISTER' | 'LOGIN'>(initialTab);
  const [offer, setOffer] = useState<CouponOffer | null>(propOffer ?? null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (propOffer !== undefined) {
      setOffer(propOffer);
      return;
    }
    if (!open) return;
    fetch('/api/coupons/validate')
      .then((r) => r.json())
      .then((d) => {
        if (d.offer) setOffer(d.offer);
      })
      .catch(() => {});
  }, [open, propOffer]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = tab === 'REGISTER' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        tab === 'REGISTER'
          ? { name, email, phone, password }
          : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (tab === 'REGISTER' ? 'Registration failed' : 'Sign in failed'));
      }

      const appliedCoupon = tab === 'REGISTER' && offer?.code ? offer.code : null;
      if (appliedCoupon && typeof window !== 'undefined') {
        sessionStorage.setItem('rehas_auto_coupon', appliedCoupon);
      }

      onSuccess(data.user, appliedCoupon);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="checkout-auth-title">
      <div className={styles.modal}>
        <div className={styles.offerBanner}>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close popup">
            <X size={16} />
          </button>

          <div className={styles.offerBadge}>
            <Sparkles size={13} />
            {offer ? `Unlock ${offer.discountPct}% Member Discount` : 'Sacred Member Access'}
          </div>

          <h2 id="checkout-auth-title" className={styles.offerTitle}>
            {offer
              ? `Create Your Account & Get ${offer.discountPct}% Discount`
              : 'Sign In or Create Your Account'}
          </h2>

          <p className={styles.offerSub}>
            {offer ? (
              <>
                Register now to claim <strong>{offer.discountPct}% OFF</strong> with admin coupon
                <span className={styles.couponChip}>{offer.code}</span>
                {offer.minOrderValue > 0 ? ` on orders above ₹${offer.minOrderValue}` : ''} &amp; proceed to checkout.
              </>
            ) : (
              'Sign in or register in seconds to track your sacred orders and complete checkout.'
            )}
          </p>
        </div>

        <div className={styles.body}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${tab === 'REGISTER' ? styles.tabBtnActive : ''}`}
              onClick={() => {
                setTab('REGISTER');
                setError(null);
              }}
            >
              Create Account {offer ? `(${offer.discountPct}% Off)` : ''}
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${tab === 'LOGIN' ? styles.tabBtnActive : ''}`}
              onClick={() => {
                setTab('LOGIN');
                setError(null);
              }}
            >
              Sign In
            </button>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            {tab === 'REGISTER' && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name *</label>
                  <div className={styles.inputWrap}>
                    <User size={16} className={styles.inputIcon} />
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

                <div className={styles.field}>
                  <label className={styles.label}>Mobile Number (+91)</label>
                  <div className={styles.inputWrap}>
                    <Phone size={16} className={styles.inputIcon} />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className={styles.input}
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.field}>
              <label className={styles.label}>Email Address *</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password *</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder={tab === 'REGISTER' ? 'At least 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? (
                'Please wait...'
              ) : tab === 'REGISTER' ? (
                <>
                  <Tag size={16} />
                  <span>
                    {offer
                      ? `Create Account & Apply ${offer.discountPct}% Off`
                      : 'Create Account & Checkout'}
                  </span>
                </>
              ) : (
                <>
                  <span>Sign In & Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className={styles.footerNote}>
            Your session is encrypted and synced with your REHAS Merchandise account.
          </p>
        </div>
      </div>
    </div>
  );
}
