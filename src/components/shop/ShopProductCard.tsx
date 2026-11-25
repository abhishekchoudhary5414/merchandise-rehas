'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Check,
  ChevronRight
} from 'lucide-react';
import styles from './ShopProductCard.module.css';

export interface ShopProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  primaryImage: string | null;
  rating?: number;
  reviewCount?: number;
  primaryCrystal?: string | null;
  rulingPlanet?: string | null;
  isBestSeller?: boolean;
}

export default function ShopProductCard({
  id,
  slug,
  name,
  price,
  compareAtPrice,
  primaryImage,
  rating = 4.9,
  reviewCount = 108,
  primaryCrystal,
  rulingPlanet,
  isBestSeller = false,
}: ShopProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Default fallback image if broken or missing
  const defaultImage = 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80';
  const effectiveImage = !primaryImage || imgError ? defaultImage : primaryImage;

  // Sync wishlist status
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rehas_wishlist') || '[]');
      if (Array.isArray(saved)) {
        setIsWishlisted(saved.some((item: any) => item.id === id || item.slug === slug));
      }
    } catch {
      // ignore
    }
  }, [id, slug]);

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem('rehas_wishlist') || '[]');
      let updated = [];
      if (isWishlisted) {
        updated = saved.filter((item: any) => item.id !== id && item.slug !== slug);
        setIsWishlisted(false);
      } else {
        updated = [
          ...saved,
          {
            id,
            name,
            slug,
            image: effectiveImage,
            price,
          },
        ];
        setIsWishlisted(true);
      }
      localStorage.setItem('rehas_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('rehas_wishlist_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // ignore
    }
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem('rehas_cart') || '[]');
      const existingIdx = cart.findIndex((item: any) => item.id === id || item.slug === slug);

      if (existingIdx > -1) {
        cart[existingIdx].quantity = (Number(cart[existingIdx].quantity) || 1) + 1;
      } else {
        cart.push({
          id,
          name,
          slug,
          price,
          image: effectiveImage,
          quantity: 1,
        });
      }

      localStorage.setItem('rehas_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('rehas_cart_updated'));
      window.dispatchEvent(new Event('storage'));

      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    } catch {
      // ignore
    }
  }

  const discountPct = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  return (
    <div className={styles.productCard}>
      {/* Top Image Box */}
      <div className={styles.cardTopImage}>
        <Link href={`/product/${slug}`} className={styles.imageLinkWrap}>
          <img
            src={effectiveImage}
            alt={name}
            className={styles.cardImg}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </Link>

        {/* Wishlist Button (Heart) */}
        <button
          type="button"
          onClick={toggleWishlist}
          className={styles.wishlistBtn}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart 
            size={16} 
            color={isWishlisted ? '#E11D48' : '#4B5563'} 
            fill={isWishlisted ? '#E11D48' : 'none'} 
          />
        </button>

        {/* Amazon/Flipkart Badges */}
        {isBestSeller && (
          <span className={styles.badgeBestseller}>
            <Sparkles size={10} /> Bestseller
          </span>
        )}

        {discountPct && (
          <span className={styles.badgeDiscount}>
            {discountPct}% OFF
          </span>
        )}

        {/* Vedic Energized Pill */}
        <div className={styles.mantraPill}>
          <ShieldCheck size={11} color="#D8B878" />
          <span>Vedic Energized</span>
        </div>
      </div>

      {/* Card Details Body */}
      <div className={styles.cardBody}>
        {/* Astrological / Crystal Sub-heading */}
        <div className={styles.astrologyMeta}>
          {primaryCrystal ? (
            <span>💎 {primaryCrystal}</span>
          ) : (
            <span>💎 Natural Healing Gemstone</span>
          )}
          {rulingPlanet && <span>• 🪐 {rulingPlanet}</span>}
        </div>

        {/* Product Title */}
        <Link href={`/product/${slug}`} className={styles.cardTitle}>
          {name}
        </Link>

        {/* Rating Section (Flipkart Signature Green Pill) */}
        <div className={styles.ratingSection}>
          <span className={styles.ratingPill}>
            <span>{rating}</span>
            <Star size={10} fill="#FFFFFF" />
          </span>
          <span className={styles.reviewCount}>
            ({reviewCount.toLocaleString('en-IN')} ratings)
          </span>
        </div>

        {/* Pricing Layout */}
        <div className={styles.priceSection}>
          <span className={styles.currentPrice}>₹{price.toLocaleString('en-IN')}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className={styles.mrpPrice}>₹{compareAtPrice.toLocaleString('en-IN')}</span>
          )}
          {discountPct && (
            <span className={styles.saveDiscount}>Save {discountPct}%</span>
          )}
        </div>

        {/* Action Row: Add to Cart + View Details */}
        <div className={styles.actionRow}>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`${styles.addToCartBtn} ${isAddedToCart ? styles.addedActive : ''}`}
            aria-label="Add to cart"
          >
            {isAddedToCart ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <Link href={`/product/${slug}`} className={styles.viewBtn}>
            <span>View</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
