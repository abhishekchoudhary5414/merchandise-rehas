'use client';

import React from 'react';
import styles from './AnnouncementBar.module.css';

export default function AnnouncementBar() {
  const announcements = [
    '✨ REHAS Sacred Merchandise: Hand-Selected Natural Crystals Consecrated with Vedic Mantras',
    '🚚 Free Express Doorstep Delivery Across India on Orders Above ₹999',
    '💎 Use Code REHAS10 for 10% Instant Festive Off',
    '🛡️ Cash on Delivery (COD) & Razorpay 100% Secured Payments',
    '🕉️ Authentic Gemstone Lab Certification Included with Every Order',
  ];

  return (
    <div className={styles.bar}>
      {/* Desktop View: Centered clean layout */}
      <div className={styles.desktopContent}>
        <span className={styles.highlight}>✨ REHAS Sacred Merchandise</span>
        <span className={styles.dot}>•</span>
        <span>Free Express Delivery Across India Above ₹999</span>
        <span className={styles.dot}>•</span>
        <span>Mantra Consecrated Natural Crystals</span>
        <span className={styles.dot}>•</span>
        <span className={styles.coupon}>Use Code <strong>REHAS10</strong> for 10% Off</span>
      </div>

      {/* Mobile View: Smooth Continuous Marquee Ticker */}
      <div className={styles.mobileMarqueeContainer}>
        <div className={styles.marqueeTrack}>
          {announcements.map((text, idx) => (
            <span key={idx} className={styles.marqueeItem}>
              {text} <span className={styles.marqueeSeparator}>✦</span>
            </span>
          ))}
          {/* Duplicate track for seamless infinite marquee loop */}
          {announcements.map((text, idx) => (
            <span key={`dup-${idx}`} className={styles.marqueeItem}>
              {text} <span className={styles.marqueeSeparator}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
