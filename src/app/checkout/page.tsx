'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';

import {
  INDIAN_STATES_AND_UTS,
  formatINR,
  isValidIndianMobile,
  isValidIndianPinCode,
  calculateShippingAndTax,
} from '@/lib/india-localization';
import { clearCart } from '@/lib/store-sync';
import styles from './CheckoutPage.module.css';

interface CheckoutItem {
  productId?: string;
  id?: string;
  name: string;
  slug?: string;
  sku?: string;
  image?: string;
  quantity: number;
  unitPrice?: number;
  price?: number;
  wristSize?: string;
  tier?: string;
  ritual?: boolean;
}

function CheckoutContent() {
  const router = useRouter();

  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [source, setSource] = useState<'cart' | 'buy_now'>('buy_now');
  const [loaded, setLoaded] = useState(false);

  // Auth & Discount Popup
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [couponOffer, setCouponOffer] = useState<{ code: string; discountPct: number } | null>(null);

  // Shipping config from Admin
  const [shippingConfig, setShippingConfig] = useState({
    freeShippingThreshold: 999,
    flatRate: 79,
    codEnabled: true,
    codFee: 49,
  });

  // Coupon state
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Address & Customer Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [flatBuilding, setFlatBuilding] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState<string>(INDIAN_STATES_AND_UTS[8]);
  const [pinCode, setPinCode] = useState('');

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [saveToAccountProfile, setSaveToAccountProfile] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressSavedSuccess, setAddressSavedSuccess] = useState(false);

  // Payment
  const paymentMethod = 'RAZORPAY';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function initCheckout() {
      // 1. Clean legacy query URL if someone navigated with ?productId=...
      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const qProductId = params.get('productId');
        const qQty = parseInt(params.get('quantity') || '1', 10) || 1;
        const qWrist = params.get('wristSize') || 'Free Size (Elastic)';
        const qTier = params.get('tier') || 'root';
        const qRitual = params.get('ritual') === '1';
        const qPin = params.get('pinCode') || '';

        if (qPin) setPinCode(qPin);

        if (qProductId) {
          try {
            const res = await fetch(`/api/admin/products/${qProductId}`);
            const data = await res.json();
            if (data.product) {
              const p = data.product;
              const tierBase =
                qTier === 'divine' && p.divinePrice
                  ? p.divinePrice
                  : qTier === 'aura' && p.auraPrice
                  ? p.auraPrice
                  : p.rootPrice || p.price;
              const ritualAdd = qRitual ? p.energyRitualPrice ?? 150 : 0;
              const legacyItem: CheckoutItem = {
                productId: p.id,
                name: p.name,
                slug: p.slug,
                sku: p.sku,
                image: p.primaryImage,
                quantity: qQty,
                unitPrice: tierBase + ritualAdd,
                wristSize: qWrist,
                tier: qTier,
                ritual: qRitual,
              };
              setItems([legacyItem]);
              setSource('buy_now');
              localStorage.setItem(
                'rehas_checkout_session',
                JSON.stringify({ source: 'buy_now', items: [legacyItem], pinCode: qPin })
              );
            }
          } catch {
            // Ignore
          }
        }
        window.history.replaceState(null, '', '/checkout');
      } else {
        // Load from rehas_checkout_session or fallback to rehas_cart
        try {
          const sessionRaw = localStorage.getItem('rehas_checkout_session');
          if (sessionRaw) {
            const parsed = JSON.parse(sessionRaw);
            if (Array.isArray(parsed.items) && parsed.items.length > 0) {
              setItems(parsed.items);
              setSource(parsed.source === 'cart' ? 'cart' : 'buy_now');
              if (parsed.pinCode) setPinCode(parsed.pinCode);
            }
          } else {
            const cartRaw = JSON.parse(localStorage.getItem('rehas_cart') || '[]');
            if (Array.isArray(cartRaw) && cartRaw.length > 0) {
              setItems(cartRaw);
              setSource('cart');
            }
          }
        } catch {
          // Ignore
        }
      }

      setLoaded(true);

      // 2. Fetch shipping settings & active admin coupon offer
      fetch('/api/admin/settings/shipping')
        .then((r) => r.json())
        .then((d) => {
          if (d.config) {
            setShippingConfig({
              freeShippingThreshold: d.config.freeShippingThreshold ?? 999,
              flatRate: d.config.flatRate ?? 79,
              codEnabled: d.config.codEnabled ?? true,
              codFee: d.config.codFee ?? 49,
            });
          }
        })
        .catch(() => {});

      fetch('/api/coupons/validate')
        .then((r) => r.json())
        .then((d) => {
          if (d.offer) setCouponOffer(d.offer);
        })
        .catch(() => {});

      // 3. Check user login status
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (meData.user) {
          setUser(meData.user);
          setName(meData.user.name || '');
          setEmail(meData.user.email || '');
          setPhone(meData.user.phone || '');

          const accountRes = await fetch('/api/account');
          const accountData = await accountRes.json();
          if (accountRes.ok && Array.isArray(accountData.user?.addresses)) {
            const addresses = accountData.user.addresses;
            setSavedAddresses(addresses);
            const defaultAddress = addresses.find((item: any) => item.isDefault) || addresses[0];
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setName(defaultAddress.fullName || meData.user.name || '');
              setPhone(defaultAddress.phone || meData.user.phone || '');
              setFlatBuilding(defaultAddress.flatBuilding || '');
              setStreetArea(defaultAddress.streetArea || '');
              setLandmark(defaultAddress.landmark || '');
              setCity(defaultAddress.city || '');
              setState(defaultAddress.state || INDIAN_STATES_AND_UTS[8]);
              setPinCode(defaultAddress.pinCode || '');
            }
          }
        } else {
          // Not logged in — redirect to login with return URL
          router.push('/login?redirect=/checkout');
          return;
        }
      } catch {
        router.push('/login?redirect=/checkout');
        return;
      } finally {
        setAuthChecked(true);
      }
    }

    initCheckout();
  }, []);

  function getItemUnitPrice(it: any): number {
    return Number(it.unitPrice ?? it.price ?? 0);
  }

  function getItemId(it: any): string {
    return it.productId || it.id || '';
  }

  const rawSubtotal = items.reduce((sum, it) => sum + getItemUnitPrice(it) * (Number(it.quantity) || 1), 0);

  async function validateAndApplyCoupon(codeToApply: string) {
    const clean = codeToApply.trim().toUpperCase();
    if (!clean) return;
    setCouponMsg(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, subtotal: rawSubtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponMsg({ ok: false, text: data.error || 'Invalid coupon code' });
        return;
      }
      setCoupon(data.coupon.code);
      setAppliedCode(data.coupon.code);
      setDiscount(data.discountAmount);
      setCouponApplied(true);
      setCouponMsg({
        ok: true,
        text: `${data.coupon.code} applied (${data.coupon.discountPct}% OFF)!`,
      });
    } catch {
      setCouponMsg({ ok: false, text: 'Could not validate coupon right now' });
    }
  }

  // Auto-apply welcome coupon after registration
  useEffect(() => {
    if (!loaded || rawSubtotal <= 0) return;
    const autoCode = sessionStorage.getItem('rehas_auto_coupon');
    if (autoCode && !couponApplied) {
      sessionStorage.removeItem('rehas_auto_coupon');
      validateAndApplyCoupon(autoCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, rawSubtotal]);

  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discount);
  const calc = calculateShippingAndTax({
    subtotal: subtotalAfterDiscount,
    paymentMethod,
    flatRate: shippingConfig.flatRate,
    freeShippingThreshold: shippingConfig.freeShippingThreshold,
    codFee: shippingConfig.codFee,
  });

  function clearAfterOrder() {
    try {
      localStorage.removeItem('rehas_checkout_session');
      if (source === 'cart') {
        clearCart(true);
      }
    } catch {
      // Ignore
    }
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg('Please sign in or create an account to complete your order.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your checkout session is empty.');
      return;
    }

    if (!name || !email || !phone) {
      setErrorMsg('Please provide full name, email, and Indian mobile number.');
      return;
    }

    if (!isValidIndianMobile(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (+91).');
      return;
    }

    if (!isValidIndianPinCode(pinCode)) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!flatBuilding || !streetArea || !city || !state) {
      setErrorMsg('Please enter complete delivery address details.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If user opted to save this newly entered address to profile, save it in background
      if (user && saveToAccountProfile && (!selectedAddressId || isAddingNewAddress)) {
        try {
          fetch('/api/account/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fullName: name,
              phone,
              flatBuilding,
              streetArea,
              landmark,
              city,
              state,
              pinCode,
              isDefault: savedAddresses.length === 0,
            }),
          }).catch(() => {});
        } catch {
          // Non-blocking
        }
      }

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          flatBuilding,
          streetArea,
          landmark,
          city,
          state,
          pinCode,
          paymentMethod,
          couponCode: couponApplied ? appliedCode : null,
          items: items.map((it) => ({
            productId: getItemId(it),
            quantity: Number(it.quantity) || 1,
            wristSize: it.wristSize || 'Free Size (Elastic)',
            tier: it.tier || 'root',
            ritual: Boolean(it.ritual),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order creation failed');
      }

      const order = data.order;

      if (paymentMethod === 'RAZORPAY') {
        const razorpayKey = data.razorpay?.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        if (
          typeof window !== 'undefined' &&
          (window as any).Razorpay &&
          razorpayKey &&
          data.razorpay?.orderId &&
          !data.razorpay.orderId.startsWith('order_sim_')
        ) {
          const options = {
            key: razorpayKey,
            amount: data.razorpay.amount,
            currency: 'INR',
            name: 'REHAS Sacred Merchandise',
            description: data.razorpay.description || 'Sacred Energy Bracelets',
            image: '/images/rehas-logo.png',
            order_id: data.razorpay.orderId,
            prefill: { name, email, contact: phone },
            notes: { orderId: order.id, orderNumber: order.orderNumber },
            theme: { color: '#560067' },
            handler: async function (response: any) {
              try {
                const verifyRes = await fetch('/api/orders/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: order.id,
                    razorpayOrderId: response.razorpay_order_id || data.razorpay.orderId,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  }),
                });
                if (!verifyRes.ok) {
                  const vData = await verifyRes.json();
                  throw new Error(vData.error || 'Payment verification failed');
                }
                clearAfterOrder();
                router.push(`/order-confirmed?orderNumber=${order.orderNumber}`);
              } catch (verifyErr: any) {
                setErrorMsg(verifyErr.message || 'Payment verification failed');
                setIsSubmitting(false);
              }
            },
            modal: {
              ondismiss: async function () {
                setIsSubmitting(false);
                setErrorMsg('Payment was cancelled. You can retry checkout anytime.');
                try {
                  await fetch('/api/orders/cancel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: order.id, reason: 'User dismissed Razorpay payment' }),
                  });
                } catch {
                  // ignore
                }
              },
            },
          };

          const rzpInstance = new (window as any).Razorpay(options);
          rzpInstance.on('payment.failed', function (failResp: any) {
            setErrorMsg(failResp.error?.description || 'Payment failed. Please try again.');
            setIsSubmitting(false);
          });
          rzpInstance.open();
        } else {
          const verifyRes = await fetch('/api/orders/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              razorpayOrderId: data.razorpay.orderId,
              razorpayPaymentId: `pay_sim_${Date.now()}`,
              razorpaySignature: 'simulated_valid_signature',
            }),
          });
          if (!verifyRes.ok) {
            const vData = await verifyRes.json();
            throw new Error(vData.error || 'Payment verification failed');
          }
          clearAfterOrder();
          router.push(`/order-confirmed?orderNumber=${order.orderNumber}`);
        }
      } else {
        clearAfterOrder();
        router.push(`/order-confirmed?orderNumber=${order.orderNumber}&cod=true`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while placing your order.');
      setIsSubmitting(false);
    }
  }

  function selectSavedAddress(addressId: string) {
    const selected = savedAddresses.find((item) => item.id === addressId);
    if (!selected) return;
    setSelectedAddressId(addressId);
    setIsAddingNewAddress(false);
    setName(selected.fullName || name);
    setPhone(selected.phone || phone);
    setFlatBuilding(selected.flatBuilding || '');
    setStreetArea(selected.streetArea || '');
    setLandmark(selected.landmark || '');
    setCity(selected.city || '');
    setState(selected.state || INDIAN_STATES_AND_UTS[8]);
    setPinCode(selected.pinCode || '');
  }

  function handleAddNewAddress() {
    setSelectedAddressId('');
    setIsAddingNewAddress(true);
    setAddressSavedSuccess(false);
    setFlatBuilding('');
    setStreetArea('');
    setLandmark('');
    setCity('');
    setState(INDIAN_STATES_AND_UTS[8]);
    setPinCode('');
  }

  async function handleSaveAddressDirectly() {
    setErrorMsg(null);
    if (!name || !phone) {
      setErrorMsg('Please enter your full name and 10-digit mobile number.');
      return;
    }
    if (!isValidIndianMobile(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!isValidIndianPinCode(pinCode)) {
      setErrorMsg('Please enter a valid 6-digit PIN code.');
      return;
    }
    if (!flatBuilding || !streetArea || !city || !state) {
      setErrorMsg('Please fill in Flat/House No., Street/Area, City, and State.');
      return;
    }

    setSavingAddress(true);
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          phone,
          flatBuilding,
          streetArea,
          landmark,
          city,
          state,
          pinCode,
          isDefault: savedAddresses.length === 0,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save address to profile');
      }

      const newAddress = data.address;
      setSavedAddresses((prev) => [newAddress, ...prev.filter((a) => a.id !== newAddress.id)]);
      setSelectedAddressId(newAddress.id);
      setIsAddingNewAddress(false);
      setAddressSavedSuccess(true);
      setTimeout(() => setAddressSavedSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not save address to your account profile.');
    } finally {
      setSavingAddress(false);
    }
  }

  return (
    <div className={styles.pageWrap}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        <div className={styles.topBar}>
          <Link href="/cart" className={styles.backLink}>
            <ArrowBackIcon style={{ fontSize: 18 }} />
            <span>Back to Cart</span>
          </Link>
          <span className={styles.secureBadge}>
            <ShieldOutlinedIcon style={{ fontSize: 16 }} />
            <span>100% Encrypted Checkout</span>
          </span>
        </div>

        <h1 className={styles.pageTitle}>Sacred Express Checkout</h1>
        <p className={styles.pageSub}>
          Complete your order with Mantra-energized dispatch across India.
        </p>

        {!loaded || !authChecked ? (
          <div className={styles.grid}>
            {/* Left Column Skeleton */}
            <div className={styles.leftCol}>
              {/* Step 1 Skeleton */}
              <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '28px', height: '28px', borderRadius: '999px' }} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '180px', height: '22px' }} />
                </div>
                <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%', height: '48px', borderRadius: '10px' }} />
              </div>

              {/* Step 2 Skeleton */}
              <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '28px', height: '28px', borderRadius: '999px' }} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '230px', height: '22px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ height: '90px', borderRadius: '10px' }} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ height: '90px', borderRadius: '10px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%', height: '42px', borderRadius: '8px' }} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%', height: '42px', borderRadius: '8px' }} />
                </div>
              </div>

              {/* Step 3 Skeleton */}
              <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '28px', height: '28px', borderRadius: '999px' }} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '160px', height: '22px' }} />
                </div>
                <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%', height: '56px', borderRadius: '10px' }} />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <aside className={styles.summaryCard}>
              <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '140px', height: '22px', marginBottom: '18px' }} />
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '64px', height: '64px', borderRadius: '8px' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '80%', height: '16px' }} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '40%', height: '14px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%', height: '16px' }} />
                <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%', height: '16px' }} />
                <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%', height: '24px' }} />
              </div>
              <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%', height: '48px', borderRadius: '12px' }} />
            </aside>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBagIcon style={{ fontSize: 48, color: 'var(--primary)', marginBottom: '12px' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 8px' }}>
              No Items Selected for Checkout
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Explore our sacred crystal bracelets and add items to your cart to proceed.
            </p>
            <Link href="/shop" className={styles.btnPrimary} style={{ textDecoration: 'none' }}>
              Browse Sacred Collection
            </Link>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className={styles.errorBanner}>
                <ErrorOutlinedIcon style={{ fontSize: 20 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className={styles.grid}>
              {/* Left Column */}
              <div className={styles.leftCol}>
                {/* Step 1: Account Verification */}
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.stepTitle}>
                      <span className={styles.stepNum}>1</span>
                      <span>Account Verification</span>
                    </h2>
                    {user && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <VerifiedUserOutlinedIcon style={{ fontSize: 16 }} /> Verified
                      </span>
                    )}
                  </div>

                  {!authChecked ? (
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                      Checking your REHAS account session...
                    </p>
                  ) : user ? (
                    <div className={styles.signedInStrip}>
                      <div className={styles.signedInInfo}>
                        <VerifiedUserOutlinedIcon style={{ fontSize: 18 }} />
                        <span>
                          Signed in as <strong>{user.name}</strong> ({user.email})
                        </span>
                      </div>
                      <Link href="/login" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                        Switch Account
                      </Link>
                    </div>
                  ) : (
                    <div className={styles.authGateBox}>
                      <div className={styles.authGateRow}>
                        <div>
                          <p className={styles.authGateTitle}>
                            {couponOffer
                              ? `Create Your Account & Get ${couponOffer.discountPct}% Discount (${couponOffer.code})`
                              : 'Sign In or Create Your REHAS Account'}
                          </p>
                          <p className={styles.authGateDesc}>
                            Please sign in or register to track your order and unlock member discounts.
                          </p>
                        </div>
                        <div className={styles.authBtnGroup}>
                          <button
                            type="button"
                            className={styles.btnPrimary}
                            onClick={() => router.push('/login?redirect=/checkout&tab=register')}
                          >
                            <AutoAwesomeIcon style={{ fontSize: 16 }} />
                            <span>
                              {couponOffer
                                ? `Register (${couponOffer.discountPct}% Off)`
                                : 'Create Account'}
                            </span>
                          </button>
                          <button
                            type="button"
                            className={styles.btnOutline}
                            onClick={() => router.push('/login?redirect=/checkout')}
                          >
                            <LockOutlinedIcon style={{ fontSize: 16 }} />
                            <span>Sign In</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Step 2: Contact & Delivery Address */}
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.stepTitle}>
                      <span className={styles.stepNum}>2</span>
                      <span>Contact &amp; Delivery Address</span>
                    </h2>
                    {savedAddresses.length > 0 && selectedAddressId && !isAddingNewAddress && (
                      <button
                        type="button"
                        onClick={handleAddNewAddress}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          cursor: 'pointer',
                        }}
                      >
                        + Add New Address
                      </button>
                    )}
                  </div>

                  {/* Contact Info (Always shown or verified) */}
                  <div className={styles.formGrid2} style={{ marginBottom: '14px' }}>
                    <div className={styles.field}>
                      <label className={styles.label}>Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Indian Mobile Number (+91) *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.field} style={{ marginBottom: '18px' }}>
                    <label className={styles.label}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="priya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  {/* If user has saved addresses, display them */}
                  {savedAddresses.length > 0 && (
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                        <label className={styles.label} style={{ margin: 0, fontWeight: 700 }}>
                          Select Delivery Address
                        </label>
                        <Link href="/account" style={{ color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
                          Manage addresses
                        </Link>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                        {savedAddresses.map((address) => {
                          const isSelected = selectedAddressId === address.id && !isAddingNewAddress;
                          return (
                            <div
                              key={address.id}
                              onClick={() => selectSavedAddress(address.id)}
                              style={{
                                textAlign: 'left',
                                cursor: 'pointer',
                                borderRadius: '10px',
                                padding: '14px',
                                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                background: isSelected ? 'var(--primary-light)' : '#fff',
                                color: 'var(--text-primary)',
                                position: 'relative',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                <strong style={{ fontSize: '0.88rem' }}>
                                  {address.fullName}
                                  {address.isDefault ? (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--primary)', marginLeft: '6px', fontWeight: 600 }}>
                                      (Default)
                                    </span>
                                  ) : null}
                                </strong>
                                {isSelected && (
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontSize: '0.72rem',
                                    background: 'var(--primary)',
                                    color: '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                  }}>
                                    ✓ Selected
                                  </span>
                                )}
                              </div>
                              <span style={{ display: 'block', fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                                {address.flatBuilding}, {address.streetArea}
                                {address.landmark ? `, Near ${address.landmark}` : ''}<br />
                                {address.city}, {address.state} — <strong>{address.pinCode}</strong><br />
                                📱 +91 {address.phone}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Toggle to add a new address or cancel if currently adding */}
                      {isAddingNewAddress ? (
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Entering New Delivery Address:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (savedAddresses.length > 0) {
                                selectSavedAddress(savedAddresses[0].id);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            Use Saved Address Instead
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Only show address input fields if user is adding a new address OR has no saved address */}
                  {(!selectedAddressId || isAddingNewAddress || savedAddresses.length === 0) && (
                    <div style={{
                      background: savedAddresses.length > 0 ? '#faf7fc' : 'transparent',
                      padding: savedAddresses.length > 0 ? '16px' : '0',
                      borderRadius: '10px',
                      border: savedAddresses.length > 0 ? '1px dashed var(--border)' : 'none',
                    }}>
                      {savedAddresses.length > 0 && (
                        <p style={{ margin: '0 0 12px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}>
                          New Address Details
                        </p>
                      )}
                      <div className={styles.formGrid2} style={{ marginBottom: '14px' }}>
                        <div className={styles.field}>
                          <label className={styles.label}>Flat / House No. / Building *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 402, Lotus Residency"
                            value={flatBuilding}
                            onChange={(e) => setFlatBuilding(e.target.value)}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Street / Area / Locality *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. MG Road, Indiranagar"
                            value={streetArea}
                            onChange={(e) => setStreetArea(e.target.value)}
                            className={styles.input}
                          />
                        </div>
                      </div>

                      <div className={styles.field} style={{ marginBottom: '14px' }}>
                        <label className={styles.label}>Landmark (Optional)</label>
                        <input
                          type="text"
                          placeholder="Near Temple / Metro Station"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGrid3}>
                        <div className={styles.field}>
                          <label className={styles.label}>City *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Bengaluru"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>State / UT *</label>
                          <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className={styles.select}
                          >
                            {INDIAN_STATES_AND_UTS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>PIN Code *</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="6-digit PIN"
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                            className={styles.input}
                          />
                        </div>
                      </div>

                      {/* Save Address to Profile Option */}
                      {user && (
                        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              <input
                                type="checkbox"
                                checked={saveToAccountProfile}
                                onChange={(e) => setSaveToAccountProfile(e.target.checked)}
                                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <span>Save this address to my REHAS account profile</span>
                            </label>

                            <button
                              type="button"
                              onClick={handleSaveAddressDirectly}
                              disabled={savingAddress}
                              style={{
                                background: 'var(--primary-light)',
                                color: 'var(--primary)',
                                border: '1.5px solid var(--primary)',
                                borderRadius: '8px',
                                padding: '6px 14px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: savingAddress ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <SaveOutlinedIcon style={{ fontSize: 16 }} />
                              <span>{savingAddress ? 'Saving...' : 'Save Address Now'}</span>
                            </button>
                          </div>
                          {addressSavedSuccess && (
                            <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                              ✓ Address saved to your profile and selected for delivery!
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Step 3: Payment Method */}
                <section className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.stepTitle}>
                      <span className={styles.stepNum}>3</span>
                      <span>Payment Method</span>
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label className={`${styles.payOption} ${styles.payOptionActive}`}>
                      <div className={styles.payLeft}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={true}
                          readOnly
                        />
                        <CreditCardIcon style={{ fontSize: 22, color: 'var(--primary)' }} />
                        <div>
                          <div className={styles.payTitle}>UPI, Cards, NetBanking (Razorpay Secured)</div>
                          <div className={styles.paySub}>
                            Instant confirmation via Google Pay, PhonePe, Paytm, Cards &amp; NetBanking
                          </div>
                        </div>
                      </div>
                      <span className={styles.payTag}>Instant Dispatch</span>
                    </label>
                  </div>
                </section>
              </div>

              {/* Right Column: Order Summary */}
              <aside className={styles.summaryCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.stepTitle}>Order Summary</h2>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                <div className={styles.itemsList}>
                  {items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className={styles.summaryItem}>
                      <img
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={item.name}
                        className={styles.itemImg}
                      />
                      <div className={styles.itemMeta}>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemDetails}>
                          Qty: {item.quantity || 1}
                          {item.wristSize ? ` · ${item.wristSize}` : ''}
                          {item.tier ? ` · ${item.tier.toUpperCase()}` : ''}
                          {item.ritual ? ' · Energized' : ''}
                        </div>
                      </div>
                      <div className={styles.itemPrice}>
                        {formatINR(getItemUnitPrice(item) * (Number(item.quantity) || 1))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promotional Coupon */}
                <div className={styles.couponBox}>
                  <label className={styles.label}>
                    Promotional Coupon
                    {couponOffer && !couponApplied && (
                      <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '6px' }}>
                        (Try {couponOffer.code} for {couponOffer.discountPct}% Off)
                      </span>
                    )}
                  </label>
                  <div className={styles.couponRow}>
                    <input
                      type="text"
                      placeholder={couponOffer?.code || 'ENTER CODE'}
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      disabled={couponApplied}
                      className={styles.couponInput}
                    />
                    <button
                      type="button"
                      onClick={() => validateAndApplyCoupon(coupon)}
                      disabled={couponApplied || !coupon.trim()}
                      className={styles.couponBtn}
                    >
                      {couponApplied ? 'Applied' : 'Apply'}
                    </button>
                  </div>
                  {couponMsg && (
                    <div className={couponMsg.ok ? styles.couponMsgOk : styles.couponMsgErr}>
                      {couponMsg.ok && <CheckCircleOutlinedIcon style={{ fontSize: 16 }} />}
                      <span>{couponMsg.text}</span>
                    </div>
                  )}
                </div>

                <div className={styles.totalsList}>
                  <div className={styles.totalLine}>
                    <span>Subtotal</span>
                    <span>{formatINR(rawSubtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className={styles.totalLine} style={{ color: 'var(--success)', fontWeight: 700 }}>
                      <span>Coupon Discount ({appliedCode})</span>
                      <span>-{formatINR(discount)}</span>
                    </div>
                  )}

                  <div className={styles.totalLine}>
                    <span>Delivery</span>
                    <span>
                      {calc.shippingFee === 0 ? (
                        <span className={styles.freeTag}>FREE</span>
                      ) : (
                        formatINR(calc.shippingFee)
                      )}
                    </span>
                  </div>

                  <div className={styles.grandTotal}>
                    <span>Total Payable</span>
                    <span>{formatINR(calc.total)}</span>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className={styles.placeOrderBtn}>
                  {isSubmitting
                    ? 'Processing Securely...'
                    : !user
                    ? 'Sign In / Register to Place Order'
                    : `Pay Securely (${formatINR(calc.total)})`}
                </button>

                <div className={styles.trustFoot}>
                  <div>256-bit SSL encrypted · Authentic Vedic Consecrated Crystals</div>
                  <div>Estimated Delivery: 3 – 5 business days across India</div>
                </div>
              </aside>
            </form>
          </>
        )}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
          Loading checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
