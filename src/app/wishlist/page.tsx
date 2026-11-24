'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import { formatINR } from '@/lib/india-localization';
import styles from './WishlistPage.module.css';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rehas_wishlist') || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch {
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  function removeFromWishlist(id: string) {
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    localStorage.setItem('rehas_wishlist', JSON.stringify(next));
  }

  function moveToCart(item: any) {
    try {
      const cart = JSON.parse(localStorage.getItem('rehas_cart') || '[]');
      const idx = cart.findIndex((c: any) => c.productId === item.id);
      if (idx >= 0) {
        cart[idx].quantity += 1;
      } else {
        cart.push({
          productId: item.id,
          name: item.name,
          slug: item.slug,
          image: item.image,
          unitPrice: item.price || 499,
          quantity: 1,
        });
      }
      localStorage.setItem('rehas_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('rehas_cart_updated'));
    } catch {
      // Ignore
    }
    removeFromWishlist(item.id);
  }

  return (
    <div className={styles.pageWrap}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.heading}>My Wishlist</h1>
            <p className={styles.subHeading}>
              {items.length} saved {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Link href="/shop" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Browse Storefront
          </Link>
        </div>

        {!loaded ? (
          <div className={styles.emptyBox}>Loading your wishlist...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyBox}>
            <Heart size={44} color="var(--primary)" style={{ opacity: 0.7 }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', margin: 0 }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '380px', fontSize: '0.9rem' }}>
              Tap the heart icon on any sacred bracelet or merchandise item to save it here for later.
            </p>
            <Link href="/shop" className={styles.shopBtn}>
              Discover Sacred Merchandise
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <div key={item.id} className={styles.card}>
                <Link href={`/product/${item.slug}`} className={styles.imgWrap}>
                  <img
                    src={item.image || '/images/rehas-logo.png'}
                    alt={item.name}
                    className={styles.img}
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className={styles.cardBody}>
                  <Link href={`/product/${item.slug}`} className={styles.title}>
                    {item.name}
                  </Link>
                  <span className={styles.price}>{formatINR(item.price || 499)}</span>

                  <div className={styles.actions}>
                    <button type="button" onClick={() => moveToCart(item)} className={styles.moveBtn}>
                      <ShoppingCart size={15} />
                      <span>Move to Cart</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      className={styles.removeBtn}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
