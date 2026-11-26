import React from 'react';
import Link from 'next/link';
import { Sparkles, Sun, ShieldCheck, ArrowRight } from 'lucide-react';
import styles from './AboutBrand.module.css';

export default function AboutBrand() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.visualColumn}>
          <div className={styles.primaryImageWrap}>
            <img
              src="/images/rehas-philosophy.jpg"
              alt="REHAS Vedic Crystal Consecration"
              className={styles.image}
            />
            <div className={styles.imageOverlay} />
          </div>

          <div className={styles.secondaryImageWrap}>
            <img
              src="/images/courses/astrology.jpg"
              alt="Vedic Astrology & Natural Gemstones"
              className={styles.image}
            />
          </div>

          <div className={styles.floatingBadge}>
            <Sparkles size={16} className={styles.floatingBadgeIcon} />
            <div>
              <strong>Prana-Pratishtha</strong>
              <span>Vedic Mantra Energized</span>
            </div>
          </div>
        </div>

        <div className={styles.textContent}>
          <span className={styles.subtitle}>
            <Sparkles size={13} /> The REHAS Philosophy
          </span>
          <h2 className={styles.title}>Cosmic Alignment, Crafted with Vedic Integrity</h2>

          <p className={styles.lead}>
            REHAS bridges ancient Vedic astrology, planetary gemstone science, and modern conscious living.
          </p>

          <p className={styles.body}>
            Founded on the principle that crystals are living geological capacitors of frequency, our merchandise is never treated as mundane costume jewellery. Each bead is ethically sourced, lab-verified, and passed through ancient consecration ceremonies — sanctified with planetary beeja mantras and lunar energization.
          </p>

          <div className={styles.highlights}>
            <div className={styles.highlightItem}>
              <div className={styles.highlightIconWrap}>
                <Sun size={20} className={styles.highlightIcon} />
              </div>
              <div>
                <strong>Kundli Alignment</strong>
                <p>Curated to soothe malefic planetary transits (Shani, Rahu, Mangal).</p>
              </div>
            </div>
            <div className={styles.highlightItem}>
              <div className={styles.highlightIconWrap}>
                <ShieldCheck size={20} className={styles.highlightIcon} />
              </div>
              <div>
                <strong>Certified Authenticity</strong>
                <p>100% natural, unheated, undyed gemstone beads with certificate.</p>
              </div>
            </div>
          </div>

          <Link href="/shop" className={styles.btn}>
            <span>Discover the Collection</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
