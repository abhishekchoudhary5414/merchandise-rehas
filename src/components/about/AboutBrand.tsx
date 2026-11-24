import React from 'react';
import Link from 'next/link';
import { Sparkles, Sun, ShieldCheck } from 'lucide-react';
import styles from './AboutBrand.module.css';

export default function AboutBrand() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.imageGrid}>
          <div className={styles.primaryImageWrap}>
            <img
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
              alt="REHAS Astrological Energy Cleansing"
              className={styles.image}
            />
          </div>
          <div className={styles.secondaryImageWrap}>
            <img
              src="https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=600&q=80"
              alt="Raw Pyrite & Sulemani Hakik Crystals"
              className={styles.image}
            />
          </div>
        </div>

        <div className={styles.textContent}>
          <span className={styles.subtitle}>The REHAS Philosophy</span>
          <h2 className={styles.title}>Cosmic Alignment, Crafted with Vedic Integrity</h2>
          
          <p className={styles.lead}>
            REHAS bridges ancient Vedic astrology, planetary gemstone science, and modern conscious living.
          </p>

          <p className={styles.body}>
            Founded on the principle that crystals are living geological capacitors of frequency, our merchandise is never treated as mundane costume jewellery. Each bead is ethically sourced, lab-verified, and passed through ancient consecration ceremonies — sanctified with planetary beeja mantras and lunar energization.
          </p>

          <div className={styles.highlights}>
            <div className={styles.highlightItem}>
              <Sun size={20} className={styles.highlightIcon} />
              <div>
                <strong>Kundli Alignment</strong>
                <p>Curated to soothe malefic planetary transits (Shani, Rahu, Mangal).</p>
              </div>
            </div>
            <div className={styles.highlightItem}>
              <ShieldCheck size={20} className={styles.highlightIcon} />
              <div>
                <strong>Certified Authenticity</strong>
                <p>100% natural, unheated, undyed gemstone beads with certificate.</p>
              </div>
            </div>
          </div>

          <Link href="/shop" className={styles.btn}>
            Discover the Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
