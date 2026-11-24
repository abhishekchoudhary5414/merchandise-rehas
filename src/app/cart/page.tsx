'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Heart, Truck, ArrowRight } from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';

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
    try {
      const saved = JSON.parse(localStorage.getItem('rehas_cart') || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch {
      setItems([]);
    } finally {
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

  const subtotal = items.reduce((s, it) => s + (it.unitPrice || 0) * (it.quantity || 1), 0);
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
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>Your Shopping Cart</h1>
            <p className={styles.subHeading}>
              {items.length} {items.length === 1 ? 'item' : 'items'} ready for sacred dispatch
            </p>
          </div>
          <Link href="/shop" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Continue Shopping
          </Link>
        </div>

        {!loaded ? (
          <div className={styles.emptyBox}>Loading your cart...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyBox}>
            <ShoppingBag size={44} color="var(--primary)" style={{ opacity: 0.7 }} />
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
                        {formatINR((item.unitPrice || 0) * (item.quantity || 1))}
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
                          <Heart size={14} /> Save to Wishlist
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className={`${styles.actionLink} ${styles.removeLink}`}
                        >
                          <Trash2 size={14} /> Remove
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
                <Truck size={16} />
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
                <ArrowRight size={18} />
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
