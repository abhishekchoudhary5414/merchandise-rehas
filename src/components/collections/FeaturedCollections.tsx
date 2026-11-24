import React from 'react';
import Link from 'next/link';
import styles from './FeaturedCollections.module.css';

export default function FeaturedCollections() {
  const collections = [
    {
      title: 'Wealth & Business Magnet',
      subtitle: 'Mercury & Jupiter Consecration',
      image: 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80',
      tag: 'Best For Financial Growth',
      link: '/shop?category=wealth-abundance',
    },
    {
      title: 'Mangal Dosha & Grounding',
      subtitle: 'Mars & Mulank 9 Remedies',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      tag: 'Hematite & Red Jasper',
      link: '/shop?category=numerology-mulank',
    },
    {
      title: 'Maha Nazar Kavach',
      subtitle: 'Rahu-Ketu & Evil Eye Shield',
      image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
      tag: 'Sulemani Hakik & Obsidian',
      link: '/shop?category=evil-eye-nazar-suraksha',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>Curated Astrology Ensembles</span>
          <h2 className={styles.title}>Featured Sacred Collections</h2>
        </div>

        <div className={styles.grid}>
          {collections.map((col, idx) => (
            <Link key={idx} href={col.link} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src={col.image} alt={col.title} className={styles.image} />
                <div className={styles.overlay} />
              </div>
              <div className={styles.cardContent}>
                <span className={styles.tag}>{col.tag}</span>
                <h3 className={styles.cardTitle}>{col.title}</h3>
                <p className={styles.cardSubtitle}>{col.subtitle}</p>
                <span className={styles.linkText}>View Collection →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
