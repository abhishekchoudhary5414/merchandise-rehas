import React from 'react';
import { Star, Quote, CheckCircle } from 'lucide-react';
import styles from './Testimonials.module.css';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Aditya Singhal',
      location: 'Bengaluru, Karnataka',
      product: 'Money Magnet Supreme Crystal Bracelet',
      review: 'I wore the Money Magnet bracelet right before pitching for our Series A funding. The mental calm, focus, and sudden breakthrough we experienced was extraordinary. Truly sacred.',
      rating: 5,
    },
    {
      name: 'Pooja Iyer',
      location: 'Chennai, Tamil Nadu',
      product: 'Sulemani Hakik Rahu-Ketu Shanti Bracelet',
      review: 'Was going through heavy Rahu Mahadasha with constant anxiety and bad dreams. Within 3 days of wearing the blessed Hakik, a palpable protective shield settled in. Superb quality.',
      rating: 5,
    },
    {
      name: 'Rohan Deshmukh',
      location: 'Mumbai, Maharashtra',
      product: 'Hematite Grounding & Willpower (Mulank 9)',
      review: 'Being a number 9 native, my fiery temper was affecting negotiations. This hematite kada grounded me completely. Beautiful natural metallic sheen and fast delivery by Shiprocket.',
      rating: 5,
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>Verified Seeker Experiences</span>
          <h2 className={styles.title}>Spiritual Transformations with REHAS</h2>
        </div>

        <div className={styles.grid}>
          {reviews.map((r, i) => (
            <div key={i} className={styles.card}>
              <Quote size={28} className={styles.quoteIcon} />
              
              <div className={styles.stars}>
                {[...Array(r.rating)].map((_, s) => (
                  <Star key={s} size={15} className={styles.starFill} />
                ))}
              </div>

              <p className={styles.reviewText}>"{r.review}"</p>

              <div className={styles.productTag}>
                <span>Wore:</span> <strong>{r.product}</strong>
              </div>

              <div className={styles.authorRow}>
                <div>
                  <div className={styles.authorName}>{r.name}</div>
                  <div className={styles.authorLocation}>{r.location}</div>
                </div>
                <div className={styles.verifiedBadge}>
                  <CheckCircle size={14} /> Verified Order
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
