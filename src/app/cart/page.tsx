'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import { formatINR } from '@/lib/india-localization';
import styles from './CartPage.module.css';

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [shippingConfig, setShippingConfig] = useState({
    freeShippingThreshold: 999,
    flatRate: 79,
  });

  useEffect(() => {
    let localItems: any[] = [];
    try {
      const saved = JSON.parse(localStorage.getItem('rehas_cart') || '[]');
      if (Array.isArray(saved)) {
        localItems = saved;
        setItems(saved);
      }
    } catch {
      setItems([]);
    }

    // Live validation against DB so prices, titles, images, and stock are always 100% current
    if (localItems.length > 0) {
      fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: localItems }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && Array.isArray(data.items)) {
            setItems(data.items);
            localStorage.setItem('rehas_cart', JSON.stringify(data.items));
            window.dispatchEvent(new Event('rehas_cart_updated'));
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoaded(true);
        });
    } else {
      setLoaded(true);
    }

    fetch('/api/admin/settings/shipping')
      .then((r) => r.json())
      .then((d) => {
        if (d.config) {
          setShippingConfig({
            freeShippingThreshold: d.config.freeShippingThreshold ?? 999,
            flatRate: d.config.flatRate ?? 79,
          });
        }
      })
      .catch(() => {});

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  function getItemPrice(it: any): number {
    return Number(it.unitPrice ?? it.price ?? 0);
  }

  function syncCart(next: any[]) {
    setItems(next);
    localStorage.setItem('rehas_cart', JSON.stringify(next));
    window.dispatchEvent(new Event('rehas_cart_updated'));
  }

  function updateQty(idx: number, delta: number) {
    const next = items.map((it, i) =>
      i === idx ? { ...it, quantity: Math.max(1, (it.quantity || 1) + delta) } : it
    );
    syncCart(next);
  }

  function removeItem(idx: number) {
    syncCart(items.filter((_, i) => i !== idx));
  }

  function moveToWishlist(idx: number) {
    const item = items[idx];
    try {
      const wl = JSON.parse(localStorage.getItem('rehas_wishlist') || '[]');
      if (!wl.some((w: any) => w.id === item.productId)) {
        wl.push({
          id: item.productId,
          name: item.name,
          slug: item.slug,
          price: item.unitPrice,
          image: item.image,
        });
        localStorage.setItem('rehas_wishlist', JSON.stringify(wl));
      }
    } catch {
      // Ignore
    }
    removeItem(idx);
  }

  const subtotal = items.reduce((s, it) => s + getItemPrice(it) * (Number(it.quantity) || 1), 0);
  const shippingFee =
    subtotal === 0 || subtotal >= shippingConfig.freeShippingThreshold
      ? 0
      : shippingConfig.flatRate;
  const totalPayable = subtotal + shippingFee;

  function saveCheckoutAndNavigate() {
    try {
      localStorage.setItem(
        'rehas_checkout_session',
        JSON.stringify({ source: 'cart', items })
      );
    } catch {
      // Ignore
    }
    router.push('/checkout');
  }

  async function handleCheckout() {
    if (items.length === 0) return;

    let currentUser = user;
    if (!authChecked) {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        currentUser = data.user || null;
        setUser(currentUser);
      } catch {
        currentUser = null;
      }
    }

    if (!currentUser) {
      // Save cart session then redirect to login with return URL
      try {
        localStorage.setItem('rehas_checkout_session', JSON.stringify({ source: 'cart', items }));
      } catch { /* ignore */ }
      router.push('/login?redirect=/checkout');
      return;
    }

    saveCheckoutAndNavigate();
  }

  return (
    <div className={styles.pageWrap}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        <BreadcrumbNav
          items={[{ label: 'Shopping Cart' }]}
          showBackButton={true}
          backLabel="Back"
        />

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>Your Shopping Cart</h1>
            {!loaded ? (
              <div className={`${styles.skeletonLineSm} ${styles.skeletonPulse}`} style={{ width: '160px', marginTop: '6px' }} />
            ) : (
              <p className={styles.subHeading}>
                {items.length} {items.length === 1 ? 'item' : 'items'} ready for sacred dispatch
              </p>
            )}
          </div>
          <Link href="/shop" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Continue Shopping
          </Link>
        </div>

        {!loaded ? (
          <div className={styles.cartGrid}>
            <div className={styles.itemsCol}>
              {[1, 2].map((k) => (
                <div key={k} className={styles.skeletonCard}>
                  <div className={`${styles.skeletonImg} ${styles.skeletonPulse}`} />
                  <div className={styles.skeletonBody}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className={`${styles.skeletonLineLg} ${styles.skeletonPulse}`} style={{ width: '55%' }} />
                      <div className={`${styles.skeletonLineLg} ${styles.skeletonPulse}`} style={{ width: '25%' }} />
                    </div>
                    <div className={`${styles.skeletonLineSm} ${styles.skeletonPulse}`} style={{ width: '40%' }} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '80px', height: '32px' }} />
                      <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100px', height: '32px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className={styles.summaryCard}>
              <div className={`${styles.skeletonLineLg} ${styles.skeletonPulse}`} style={{ width: '45%', marginBottom: '18px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%' }} />
                <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%' }} />
                <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '80%' }} />
              </div>
              <div className={`${styles.skeletonLine} ${styles.skeletonPulse}`} style={{ width: '100%', height: '44px', borderRadius: '10px' }} />
            </aside>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyBox}>
            <ShoppingBagIcon style={{ fontSize: 48, color: 'var(--primary)', opacity: 0.7 }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', margin: 0 }}>
              Your REHAS Cart is Empty
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '380px', fontSize: '0.9rem' }}>
              Explore energized crystal bracelets, Rudraksha, and sacred merchandise crafted for harmony.
            </p>
            <Link href="/shop" className={styles.shopBtn}>
              Explore Sacred Merchandise
            </Link>
          </div>
        ) : (
          <div className={styles.cartGrid}>
            <div className={styles.itemsCol}>
              {items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className={styles.itemCard}>
                  <img
                    src={item.image || '/images/rehas-logo.png'}
                    alt={item.name}
                    className={styles.itemImg}
                    referrerPolicy="no-referrer"
                  />
                  <div className={styles.itemBody}>
                    <div className={styles.itemTop}>
                      <Link href={`/product/${item.slug}`} className={styles.itemTitle}>
                        {item.name}
                      </Link>
                      <span className={styles.itemPrice}>
                        {formatINR(getItemPrice(item) * (Number(item.quantity) || 1))}
                      </span>
                    </div>

                    <div className={styles.metaRow}>
                      {item.tier && item.tier !== 'standard' && (
                        <span className={styles.metaPill}>Edition: {item.tier.toUpperCase()}</span>
                      )}
                      {item.wristSize && <span className={styles.metaPill}>Size: {item.wristSize}</span>}
                      {item.ritual && (
                        <span className={`${styles.metaPill} ${styles.ritualPill}`}>
                          + Energy Activation Ritual
                        </span>
                      )}
                    </div>

                    <div className={styles.itemActions}>
                      <div className={styles.qtyStepper}>
                        <button type="button" onClick={() => updateQty(idx, -1)} className={styles.qtyBtn}>
                          -
                        </button>
                        <span className={styles.qtyVal}>{item.quantity || 1}</span>
                        <button type="button" onClick={() => updateQty(idx, 1)} className={styles.qtyBtn}>
                          +
                        </button>
                      </div>

                      <div className={styles.textActions}>
                        <button
                          type="button"
                          onClick={() => moveToWishlist(idx)}
                          className={styles.actionLink}
                        >
                          <FavoriteBorderIcon style={{ fontSize: 16 }} /> Save to Wishlist
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className={`${styles.actionLink} ${styles.removeLink}`}
                        >
                          <DeleteOutlinedIcon style={{ fontSize: 16 }} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Price Details</h2>

              <div className={styles.summaryRow}>
                <span>Subtotal ({items.reduce((s, it) => s + (it.quantity || 1), 0)} items)</span>
                <strong>{formatINR(subtotal)}</strong>
              </div>

              <div className={styles.summaryRow}>
                <span>Delivery Charges</span>
                <strong style={{ color: shippingFee === 0 ? 'var(--success)' : undefined }}>
                  {shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
                </strong>
              </div>

              <div className={styles.freeShipNote}>
                <LocalShippingOutlinedIcon style={{ fontSize: 18 }} />
                <span>
                  {subtotal >= shippingConfig.freeShippingThreshold
                    ? 'Yay! Your order qualifies for FREE Delivery across India.'
                    : `Add ${formatINR(shippingConfig.freeShippingThreshold - subtotal)} more for FREE Delivery.`}
                </span>
              </div>

              <div className={styles.totalRow}>
                <span>Total Payable</span>
                <span>{formatINR(totalPayable)}</span>
              </div>

              <button type="button" onClick={handleCheckout} className={styles.checkoutBtn}>
                <span>{user ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
                <ArrowForwardIcon style={{ fontSize: 18 }} />
              </button>
            </aside>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppFloat />

    </div>
  );
}
