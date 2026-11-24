'use client';

import React, { useState, useEffect } from 'react';
import styles from './AnnouncementBar.module.css';

export default function AnnouncementBar() {
  const [data, setData] = useState({
    freeThreshold: 999,
    couponCode: 'REHAS10',
    discountPct: 10,
    announcements: [
      '✨ REHAS Sacred Merchandise: Hand-Selected Natural Crystals Consecrated with Vedic Mantras',
      '🚚 Free Express Doorstep Delivery Across India on Orders Above ₹999',
      '💎 Use Code REHAS10 for 10% Instant Festive Off',
      '🛡️ 100% Secured Razorpay Payments',
      '🕉️ Authentic Gemstone Lab Certification Included with Every Order',
    ],
  });

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((resData) => {
        if (resData && Array.isArray(resData.announcements)) {
          setData(resData);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={styles.bar}>
      {/* Desktop View: Centered clean layout fetching dynamic DB free threshold and coupon */}
      <div className={styles.desktopContent}>
        <span className={styles.highlight}>✨ REHAS Sacred Merchandise</span>
        <span className={styles.dot}>•</span>
        <span>Free Express Delivery Across India Above ₹{data.freeThreshold}</span>
        <span className={styles.dot}>•</span>
        <span>Mantra Consecrated Natural Crystals</span>
        <span className={styles.dot}>•</span>
        <span className={styles.coupon}>
          Use Code <strong>{data.couponCode}</strong> for {data.discountPct}% Off
        </span>
      </div>

      {/* Mobile View: Smooth Continuous Marquee Ticker */}
      <div className={styles.mobileMarqueeContainer}>
        <div className={styles.marqueeTrack}>
          {data.announcements.map((text, idx) => (
            <span key={idx} className={styles.marqueeItem}>
              {text} <span className={styles.marqueeSeparator}>✦</span>
            </span>
          ))}
          {/* Duplicate track for seamless infinite marquee loop */}
          {data.announcements.map((text, idx) => (
            <span key={`dup-${idx}`} className={styles.marqueeItem}>
              {text} <span className={styles.marqueeSeparator}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
