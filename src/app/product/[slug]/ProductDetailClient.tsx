'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Truck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
} from 'lucide-react';
import { formatINR, isValidIndianPinCode } from '@/lib/india-localization';
import styles from './ProductDetail.module.css';

interface MediaItem {
  id?: string;
  url: string;
  type?: 'image' | 'video';
  name?: string;
  fileId?: string;
}

interface ProductDetailClientProps {
  product: any;
  freeShippingThreshold?: number;
}

export default function ProductDetailClient({
  product,
  freeShippingThreshold = 999,
}: ProductDetailClientProps) {
  const router = useRouter();
  const sc = (product.structuredContent as any) || {};

  // Build media list strictly from DB
  const mediaItems: MediaItem[] =
    Array.isArray(sc.media) && sc.media.length > 0
      ? sc.media
      : product.primaryImage
      ? [{ id: 'primary', url: product.primaryImage, type: 'image', name: product.name }]
      : [];

  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

  // 3-Tier Edition Pricing strictly from DB
  const tiers = [
    product.rootPrice ? { key: 'root', label: 'Root', price: Number(product.rootPrice) } : null,
    product.auraPrice ? { key: 'aura', label: 'Aura', price: Number(product.auraPrice) } : null,
    product.divinePrice ? { key: 'divine', label: 'Divine', price: Number(product.divinePrice) } : null,
  ].filter(Boolean) as { key: string; label: string; price: number }[];

  const [selectedTier, setSelectedTier] = useState<string>(tiers[0]?.key || 'standard');
  const activeTierPrice =
    tiers.find((t) => t.key === selectedTier)?.price ?? Number(product.price || 0);

  // Energy Activation Ritual strictly from DB
  const hasRitual = Boolean(
    product.energyRitualPrice !== null &&
      product.energyRitualPrice !== undefined &&
      Number(product.energyRitualPrice) > 0 &&
      product.energyRitualDesc
  );
  const ritualPrice = hasRitual ? Number(product.energyRitualPrice) : 0;
  const [includeRitual, setIncludeRitual] = useState(false);

  const finalUnitPrice = activeTierPrice + (includeRitual ? ritualPrice : 0);

  // Size strictly from DB (variants OR specifications.size OR beadSize)
  const dbSizes: string[] = [];
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    for (const v of product.variants) {
      if (v.wristSize && !dbSizes.includes(v.wristSize)) dbSizes.push(v.wristSize);
    }
  } else if (sc.specifications?.size && typeof sc.specifications.size === 'string') {
    const parts = sc.specifications.size
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    dbSizes.push(...parts);
  } else if (product.beadSize) {
    dbSizes.push(product.beadSize);
  }
  const [selectedSize, setSelectedSize] = useState<string>(dbSizes[0] || '');

  const [quantity, setQuantity] = useState(1);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rehas_wishlist') || '[]');
      if (Array.isArray(saved) && saved.some((item: any) => item.id === product.id)) {
        setWishlisted(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, [product.id]);

  function handleAddToCart() {
    try {
      const existing = JSON.parse(localStorage.getItem('rehas_cart') || '[]');
      const cartItem = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: activeMedia?.url || product.primaryImage,
        tier: selectedTier,
        ritual: includeRitual,
        wristSize: selectedSize,
        unitPrice: finalUnitPrice,
        quantity,
      };
      const matchIdx = existing.findIndex(
        (c: any) =>
          c.productId === cartItem.productId &&
          c.tier === cartItem.tier &&
          c.ritual === cartItem.ritual &&
          c.wristSize === cartItem.wristSize
      );
      if (matchIdx >= 0) {
        existing[matchIdx].quantity += quantity;
      } else {
        existing.push(cartItem);
      }
      localStorage.setItem('rehas_cart', JSON.stringify(existing));
      window.dispatchEvent(new Event('rehas_cart_updated'));
      setActionFeedback(`Added ${quantity} × ${product.name} to your Cart!`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch {
      setActionFeedback('Added to Cart!');
    }
  }

  function handleToggleWishlist() {
    try {
      const existing = JSON.parse(localStorage.getItem('rehas_wishlist') || '[]');
      const exists = existing.some((item: any) => item.id === product.id);
      let updated: any[];
      if (exists) {
        updated = existing.filter((item: any) => item.id !== product.id);
        setWishlisted(false);
        setActionFeedback('Removed from Wishlist.');
      } else {
        updated = [
          ...existing,
          {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: activeTierPrice,
            image: activeMedia?.url || product.primaryImage,
          },
        ];
        setWishlisted(true);
        setActionFeedback('Saved to your Wishlist!');
      }
      localStorage.setItem('rehas_wishlist', JSON.stringify(updated));
      setTimeout(() => setActionFeedback(null), 3500);
    } catch {
      setWishlisted(!wishlisted);
    }
  }

  const activeMedia = mediaItems[selectedMediaIdx] || mediaItems[0];

  function handleSlide(dir: -1 | 1) {
    if (mediaItems.length <= 1) return;
    setSelectedMediaIdx((prev) => (prev + dir + mediaItems.length) % mediaItems.length);
  }

  function handleBuyNow() {
    const query = new URLSearchParams({
      productId: product.id,
      quantity: quantity.toString(),
      ...(selectedSize ? { wristSize: selectedSize } : {}),
      tier: selectedTier,
      ritual: includeRitual ? '1' : '0',
    });
    router.push(`/checkout?${query.toString()}`);
  }

  const trustBadges: string[] = Array.isArray(sc.trustBadges) ? sc.trustBadges : [];
  const keyFeatures: string[] = Array.isArray(sc.keyFeatures) ? sc.keyFeatures : [];
  const benefits: string[] = Array.isArray(sc.benefits) ? sc.benefits : [];
  const spiritualSignificance: string[] = Array.isArray(sc.spiritualSignificance)
    ? sc.spiritualSignificance
    : [];
  const howToUse: string[] = Array.isArray(sc.howToUse) ? sc.howToUse : [];
  const careInstructions: string[] = Array.isArray(sc.careInstructions) ? sc.careInstructions : [];
  const faqs: { question: string; answer: string }[] = Array.isArray(sc.faqs) ? sc.faqs : [];

  const summaryText = sc.productSummary || product.description;
  const hookText = sc.emotionalHook || product.shortDescription;

  const specRows = [
    product.sku ? { label: 'SKU', value: product.sku, mono: true } : null,
    sc.specifications?.material || product.primaryCrystal
      ? { label: 'Material', value: sc.specifications?.material || product.primaryCrystal }
      : null,
    sc.specifications?.beadType ? { label: 'Bead / Craft Type', value: sc.specifications.beadType } : null,
    sc.specifications?.size ? { label: 'Size', value: sc.specifications.size } : null,
    sc.specifications?.weight ? { label: 'Weight', value: sc.specifications.weight } : null,
    sc.specifications?.origin ? { label: 'Origin', value: sc.specifications.origin } : null,
  ].filter(Boolean) as { label: string; value: string; mono?: boolean }[];

  return (
    <main className={styles.pageMain}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Home</Link>
        <span>/</span>
        <Link href="/shop" className={styles.breadcrumbLink}>Shop</Link>
        {product.category?.name && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.category.slug}`} className={styles.breadcrumbLink}>
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className={styles.breadcrumbCurrent}>{product.name}</span>
      </nav>

      {/* Top 2-Column Showcase */}
      <div className={styles.heroGrid}>
        {/* Left: Amazon / Flipkart Style Vertical Thumbnail Rail + Main Slider */}
        <div className={styles.galleryCol}>
          {mediaItems.length > 0 && (
            <div
              className={styles.galleryShowcase}
              style={mediaItems.length <= 1 ? { gridTemplateColumns: '1fr' } : undefined}
            >
              {mediaItems.length > 1 && (
                <div className={styles.thumbStrip}>
                  {mediaItems.map((m, idx) => (
                    <button
                      key={m.id || idx}
                      type="button"
                      onMouseEnter={() => setSelectedMediaIdx(idx)}
                      onClick={() => setSelectedMediaIdx(idx)}
                      className={`${styles.thumbBtn} ${idx === selectedMediaIdx ? styles.thumbBtnActive : ''}`}
                    >
                      {m.type === 'video' ? (
                        <video src={m.url} className={styles.thumbImg} muted />
                      ) : (
                        <img
                          src={m.url}
                          alt={`${product.name} view ${idx + 1}`}
                          className={styles.thumbImg}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (m.fileId && !target.src.includes('drive.google.com/thumbnail')) {
                              target.src = `https://drive.google.com/thumbnail?id=${m.fileId}&sz=w400`;
                            }
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.mainMediaWrap}>
                {activeMedia?.type !== 'video' && (
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className={styles.zoomBtn}
                    title="Inspect Close-up"
                  >
                    <ZoomIn size={14} />
                    <span>Zoom</span>
                  </button>
                )}
                {mediaItems.length > 1 && (
                  <>
                    <span className={styles.slideCounter}>
                      {selectedMediaIdx + 1} / {mediaItems.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSlide(-1)}
                      className={`${styles.sliderArrow} ${styles.sliderPrev}`}
                      aria-label="Previous slide"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSlide(1)}
                      className={`${styles.sliderArrow} ${styles.sliderNext}`}
                      aria-label="Next slide"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className={styles.sliderDots}>
                      {mediaItems.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedMediaIdx(idx)}
                          className={`${styles.sliderDot} ${idx === selectedMediaIdx ? styles.sliderDotActive : ''}`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {activeMedia?.type === 'video' ? (
                  <video src={activeMedia.url} className={styles.mainMedia} controls autoPlay muted loop />
                ) : (
                  <img
                    src={activeMedia?.url}
                    alt={product.name}
                    className={styles.mainMedia}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (activeMedia?.fileId && !target.src.includes('drive.google.com/thumbnail')) {
                        target.src = `https://drive.google.com/thumbnail?id=${activeMedia.fileId}&sz=w1200`;
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Trust Badges (only if present in DB) */}
          {trustBadges.length > 0 && (
            <div className={styles.trustGrid}>
              {trustBadges.map((badge, i) => (
                <div key={i} className={styles.trustChip}>
                  <ShieldCheck size={16} />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details & Purchase Configuration */}
        <div className={styles.detailsCol}>
          <div>
            {product.category?.name && (
              <span className={styles.categoryEyebrow}>{product.category.name}</span>
            )}
            <h1 className={styles.productTitle}>{product.name}</h1>

            {product.reviewCount > 0 && (
              <div className={styles.ratingRow}>
                <div style={{ display: 'flex', color: '#e59819' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#e59819" />
                  ))}
                </div>
                <span>
                  <strong>{product.rating}</strong> ({product.reviewCount} verified reviews)
                </span>
              </div>
            )}
          </div>

          {hookText && <p className={styles.emotionalHook}>{hookText}</p>}

          {/* Live Price */}
          <div className={styles.priceBox}>
            <span className={styles.livePrice}>{formatINR(finalUnitPrice * quantity)}</span>
            {product.compareAtPrice && product.compareAtPrice > activeTierPrice && (
              <span className={styles.comparePrice}>{formatINR(product.compareAtPrice * quantity)}</span>
            )}
          </div>

          {/* Astrology Alignment Cards (only if present in DB) */}
          {(product.zodiacSigns || product.rulingPlanet || product.mulankNumber) && (
            <div className={styles.astroGrid}>
              {product.zodiacSigns && (
                <div className={styles.astroCard}>
                  <span className={styles.astroLabel}>Zodiac Sign</span>
                  <span className={styles.astroValue}>{product.zodiacSigns}</span>
                </div>
              )}
              {product.rulingPlanet && (
                <div className={styles.astroCard}>
                  <span className={styles.astroLabel}>Planet</span>
                  <span className={styles.astroValue}>{product.rulingPlanet}</span>
                </div>
              )}
              {product.mulankNumber && (
                <div className={styles.astroCard}>
                  <span className={styles.astroLabel}>Mulank</span>
                  <span className={styles.astroValue}>{product.mulankNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* 3-Tier Edition Selector (only if present in DB) */}
          {tiers.length > 0 && (
            <div>
              <span className={styles.sectionLabel}>Select Energy Edition</span>
              <div className={styles.tierGrid}>
                {tiers.map((tier) => (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setSelectedTier(tier.key)}
                    className={`${styles.tierCard} ${selectedTier === tier.key ? styles.tierCardActive : ''}`}
                  >
                    <span className={styles.tierName}>{tier.label}</span>
                    <span className={styles.tierPrice}>{formatINR(tier.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Energy Activation Ritual (only if configured in DB) */}
          {hasRitual && (
            <label className={`${styles.ritualCard} ${includeRitual ? styles.ritualCardActive : ''}`}>
              <input
                type="checkbox"
                checked={includeRitual}
                onChange={(e) => setIncludeRitual(e.target.checked)}
                className={styles.ritualCheckbox}
              />
              <div style={{ flex: 1 }}>
                <div className={styles.ritualHeader}>
                  <span className={styles.ritualTitle}>
                    <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Add Energy Activation Ritual
                  </span>
                  <span className={styles.ritualPrice}>+ {formatINR(ritualPrice)}</span>
                </div>
                <p className={styles.ritualDesc}>{product.energyRitualDesc}</p>
              </div>
            </label>
          )}

          {/* Size Selector (strictly from DB) */}
          {dbSizes.length > 0 && (
            <div>
              <span className={styles.sectionLabel}>Select Size</span>
              <div className={styles.sizeRow}>
                {dbSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`${styles.sizeBtn} ${selectedSize === sz ? styles.sizeBtnActive : ''}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Buy Now */}
          <div className={styles.buyRow}>
            <div className={styles.qtyStepper}>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className={styles.qtyBtn}
              >
                -
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity || 20, q + 1))}
                className={styles.qtyBtn}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.inStock || product.stockQuantity <= 0}
              className={styles.buyBtn}
            >
              <ShoppingBag size={18} />
              <span>
                {product.inStock && product.stockQuantity > 0
                  ? `Buy Now · ${formatINR(finalUnitPrice * quantity)}`
                  : 'Out of Stock'}
              </span>
            </button>
          </div>

          {/* Add to Cart & Wishlist */}
          <div className={styles.secondaryActionsRow}>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock || product.stockQuantity <= 0}
              className={styles.cartBtn}
            >
              <ShoppingCart size={17} />
              <span>Add to Cart</span>
            </button>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlistBtnActive : ''}`}
            >
              <Heart size={17} fill={wishlisted ? 'var(--primary)' : 'none'} />
              <span>{wishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {actionFeedback && <div className={styles.actionFeedback}>{actionFeedback}</div>}

          {/* Free Delivery Banner (Configured by Admin Store Settings) */}
          <div className={styles.pinBox} style={{ background: 'var(--primary-light)', borderColor: 'rgba(86, 0, 103, 0.18)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Truck size={17} />
              {freeShippingThreshold > 0
                ? `Free Delivery above ${formatINR(freeShippingThreshold)} across India`
                : 'Free Delivery across India'}
            </span>
          </div>
        </div>
      </div>

      {/* Non-Tabbed Content Sections (only rendered when DB data exists) */}
      <div className={styles.contentStack}>
        {/* 1. Product Summary & Best For */}
        {(summaryText || sc.bestFor || keyFeatures.length > 0 || benefits.length > 0) && (
          <section className={styles.sectionCard}>
            {summaryText && (
              <>
                <h2 className={styles.subHeading}>Product Summary</h2>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-primary)', margin: 0 }}>
                  {summaryText}
                </p>
              </>
            )}

            {sc.bestFor && (
              <div style={{ marginTop: summaryText ? '1.25rem' : 0, padding: '0.9rem 1rem', background: '#fdfbf8', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Best For: </strong>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{sc.bestFor}</span>
              </div>
            )}

            {(keyFeatures.length > 0 || benefits.length > 0) && (
              <div className={styles.twoColContent}>
                {keyFeatures.length > 0 && (
                  <div>
                    <h3 className={styles.subHeading}>Key Features</h3>
                    <div className={styles.featureCardGrid}>
                      {keyFeatures.map((feat, i) => (
                        <div key={i} className={styles.featureCard}>
                          <CheckCircle2 size={17} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {benefits.length > 0 && (
                  <div>
                    <h3 className={styles.subHeading}>Benefits</h3>
                    <div className={styles.featureCardGrid}>
                      {benefits.map((b, i) => (
                        <div key={i} className={styles.featureCard}>
                          <Sparkles size={17} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* 2. Spiritual Significance, How to Use & Care Instructions */}
        {(spiritualSignificance.length > 0 || howToUse.length > 0 || careInstructions.length > 0) && (
          <section className={styles.sectionCard}>
            <div className={styles.twoColContent} style={{ marginTop: 0 }}>
              {(spiritualSignificance.length > 0 || howToUse.length > 0) && (
                <div>
                  {spiritualSignificance.length > 0 && (
                    <div>
                      <h3 className={styles.subHeading}>Spiritual Significance</h3>
                      <ul className={styles.bulletList}>
                        {spiritualSignificance.map((item, i) => (
                          <li key={i} className={styles.bulletItem}>
                            <Sparkles size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {howToUse.length > 0 && (
                    <div style={{ marginTop: spiritualSignificance.length > 0 ? '1.5rem' : 0 }}>
                      <h3 className={styles.subHeading}>How to Use (Step-by-Step Ritual)</h3>
                      <div className={styles.timelineList}>
                        {howToUse.map((item, i) => (
                          <div key={i} className={styles.timelineStep}>
                            <span className={styles.stepNumber}>0{i + 1}</span>
                            <span style={{ fontSize: '0.885rem', lineHeight: 1.5 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {careInstructions.length > 0 && (
                <div>
                  <h3 className={styles.subHeading}>Care Instructions</h3>
                  <ul className={styles.bulletList}>
                    {careInstructions.map((item, i) => (
                      <li key={i} className={styles.bulletItem}>
                        <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3. Specifications (only rows present in DB) */}
        {specRows.length > 0 && (
          <section className={styles.sectionCard}>
            <h2 className={styles.subHeading}>Specifications</h2>
            <table className={styles.specTable}>
              <tbody>
                {specRows.map((row) => (
                  <tr key={row.label}>
                    <th>{row.label}</th>
                    <td style={row.mono ? { fontFamily: 'monospace' } : undefined}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* 4. FAQ Accordion (only if FAQs exist in DB) */}
        {faqs.length > 0 && (
          <section className={styles.faqSection}>
            <h2 className={styles.subHeading}>Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={idx} className={styles.faqItem}>
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className={styles.faqQuestionBtn}
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {isOpen && <div className={styles.faqAnswer}>{faq.answer}</div>}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Interactive Image Zoom Lightbox Modal */}
      {lightboxOpen && activeMedia && activeMedia.type !== 'video' && (
        <div
          className={styles.lightboxBackdrop}
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className={styles.lightboxClose}
              aria-label="Close zoom view"
            >
              <X size={20} />
            </button>
            <img
              src={activeMedia.url}
              alt={product.name}
              className={styles.mainMedia}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (activeMedia?.fileId && !target.src.includes('drive.google.com/thumbnail')) {
                  target.src = `https://drive.google.com/thumbnail?id=${activeMedia.fileId}&sz=w1200`;
                }
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
