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
import { addToCart, isInWishlist, toggleWishlistItem } from '@/lib/store-sync';
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
  rating = 0,
  reviewCount = 0,
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
    const syncWishlist = () => {
      setIsWishlisted(isInWishlist(id) || isInWishlist(slug));
    };
    syncWishlist();
    window.addEventListener('rehas_wishlist_updated', syncWishlist);
    window.addEventListener('storage', syncWishlist);
    return () => {
      window.removeEventListener('rehas_wishlist_updated', syncWishlist);
      window.removeEventListener('storage', syncWishlist);
    };
  }, [id, slug]);

  function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const { wishlisted } = toggleWishlistItem({
      id,
      name,
      slug,
      image: effectiveImage,
      price,
    });
    setIsWishlisted(wishlisted);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: id,
      id,
      name,
      slug,
      unitPrice: price,
      price,
      image: effectiveImage,
      quantity: 1,
    });
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000);
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
        {/* Astrological / Crystal Luxury Chips */}
        <div className={styles.astrologyMeta}>
          {primaryCrystal ? (
            <span className={styles.crystalPill}>
              <Sparkles size={11} className={styles.metaSparkle} />
              <span className={styles.pillText}>{primaryCrystal}</span>
            </span>
          ) : (
            <span className={styles.crystalPill}>
              <Sparkles size={11} className={styles.metaSparkle} />
              <span className={styles.pillText}>Certified Crystal</span>
            </span>
          )}
          {rulingPlanet && (
            <span className={styles.planetPill}>
              <span className={styles.planetIcon}>🪐</span>
              <span className={styles.pillText}>{rulingPlanet}</span>
            </span>
          )}
        </div>

        {/* Product Title */}
        <Link href={`/product/${slug}`} className={styles.cardTitle}>
          {name}
        </Link>

        {/* Rating Section (Flipkart Signature Green Pill) */}
        <div className={styles.ratingSection}>
          {reviewCount > 0 ? (
            <>
              <span className={styles.ratingPill}>
                <span>{rating > 0 ? rating.toFixed(1) : '5.0'}</span>
                <Star size={10} fill="#FFFFFF" />
              </span>
              <span className={styles.reviewCount}>
                ({reviewCount.toLocaleString('en-IN')} {reviewCount === 1 ? 'rating' : 'ratings'})
              </span>
            </>
          ) : (
            <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>
              No ratings yet
            </span>
          )}
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
