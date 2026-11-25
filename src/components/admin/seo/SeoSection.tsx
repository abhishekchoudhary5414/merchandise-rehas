'use client';

import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ShareIcon from '@mui/icons-material/Share';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PublicIcon from '@mui/icons-material/Public';
import styles from './SeoSection.module.css';

interface SeoSectionProps {
  products: any[];
}

export default function SeoSection({ products }: SeoSectionProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const metaTitle = activeProduct
    ? `${activeProduct.name} | Consecrated Vedic Merchandise | REHAS`
    : 'REHAS | Consecrated Merchandise & Astrological Crystals';

  const metaDescription = activeProduct?.shortDescription
    ? activeProduct.shortDescription
    : 'Experience consecrated spiritual tools, authentic Rudraksha beads, and energizing gemstone bracelets blessed under sacred Vedic rituals.';

  const canonicalUrl = activeProduct
    ? `https://rehas-merchandise.in/product/${activeProduct.slug}`
    : 'https://rehas-merchandise.in/shop';

  const previewImage = activeProduct?.primaryImage || '/images/rehas-logo.png';

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: activeProduct?.name || 'Vedic Consecrated Bracelet',
    image: [previewImage],
    description: metaDescription,
    sku: activeProduct?.sku || 'REHAS-SKU-001',
    brand: {
      '@type': 'Brand',
      name: 'REHAS',
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'INR',
      price: activeProduct?.price || 479,
      availability: (activeProduct?.stockQuantity ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'REHAS Merchandise',
      },
    },
  };

  return (
    <div className={styles.container}>
      {/* 1. Header Banner */}
      <div className={styles.bannerHeader}>
        <div className={styles.bannerTitleArea}>
          <span className={styles.vedicTagline}>
            <SearchIcon fontSize="inherit" />
            <span>Search Engine &amp; Rich Snippet Studio</span>
          </span>
          <h2 className={styles.mainTitle}>SEO &amp; Social Preview Studio</h2>
          <p className={styles.mainSubtitle}>
            Live Google search snippet inspection, Open Graph social share simulation &amp; structured JSON-LD validation
          </p>
        </div>

        {/* Product selector dropdown */}
        {products.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Inspect Item:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1.5px solid rgba(86, 0, 103, 0.2)',
                background: '#FFFFFF',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '13px',
                outline: 'none',
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. SEO Status Badges */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <span className={styles.pillBadge}>
          <CheckCircleIcon fontSize="inherit" style={{ color: '#16A34A' }} />
          <span>Automatic Canonical URLs Enabled</span>
        </span>
        <span className={styles.pillBadge}>
          <CheckCircleIcon fontSize="inherit" style={{ color: '#16A34A' }} />
          <span>Google Merchant Center Rich Snippets Active</span>
        </span>
        <span className={styles.pillBadge}>
          <PublicIcon fontSize="inherit" style={{ color: 'var(--secondary)' }} />
          <span>Sitemap.xml Auto-Generated</span>
        </span>
        <span className={styles.pillBadge}>
          <PublicIcon fontSize="inherit" style={{ color: 'var(--secondary)' }} />
          <span>Open Graph &amp; Twitter Card Meta Tags Built-In</span>
        </span>
      </div>

      {/* 3. Google Snippet vs Social Card Preview */}
      <div className={styles.grid2Col}>
        {/* Google SERP Preview */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <SearchIcon fontSize="small" style={{ color: 'var(--primary)' }} />
            <span>Google Search Engine Preview (SERP)</span>
          </h3>
          <div className={styles.googlePreviewBox}>
            <div className={styles.googleUrl}>
              <span style={{ fontWeight: 600 }}>rehas-merchandise.in</span>
              <span style={{ color: '#5F6368' }}>› product › {activeProduct?.slug || 'item'}</span>
            </div>
            <div className={styles.googleTitle}>{metaTitle}</div>
            <div className={styles.googleSnippet}>
              <strong>{activeProduct?.price ? `₹${activeProduct.price}.00` : 'In stock'}</strong> - {metaDescription} Consecrated with sacred Vedic energization rituals.
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong>Title length:</strong> {metaTitle.length} / 60 characters (Optimal)</div>
            <div><strong>Meta Description:</strong> {metaDescription.length} / 160 characters</div>
          </div>
        </div>

        {/* WhatsApp / Telegram / Social Share Preview */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <ShareIcon fontSize="small" style={{ color: 'var(--secondary)' }} />
            <span>Social Media Share Card Preview</span>
          </h3>

          <div className={styles.socialCardPreview}>
            <img
              src={previewImage}
              alt={activeProduct?.name || 'Preview'}
              className={styles.socialImg}
              referrerPolicy="no-referrer"
            />
            <div className={styles.socialContent}>
              <span className={styles.socialDomain}>REHAS-MERCHANDISE.IN</span>
              <span className={styles.socialTitle}>{metaTitle}</span>
              <span className={styles.socialDesc}>{metaDescription}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Structured JSON-LD Preview */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <CodeIcon fontSize="small" style={{ color: 'var(--primary)' }} />
          <span>Valid Schema.org / JSON-LD Structured Data</span>
        </h3>
        <pre
          style={{
            background: '#0F172A',
            color: '#38BDF8',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '12.5px',
            fontFamily: 'monospace',
            overflowX: 'auto',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {JSON.stringify(jsonLdSchema, null, 2)}
        </pre>
      </div>
    </div>
  );
}
