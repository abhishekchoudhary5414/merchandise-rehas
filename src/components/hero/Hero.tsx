'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  Sun,
  Flame,
  Moon,
  Compass
} from 'lucide-react';
import siteConfig from '@/data/site-config.json';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.heroRoot}>
      {/* Dynamic Background Elements & Astrological Planets - Pure CSS */}
      <div className={styles.decorCanvas} aria-hidden="true">
        <div className={styles.orbPurple} />
        <div className={styles.orbGold} />
        <div className={styles.orbCenter} />
        <div className={styles.gridMatrix} />

        {/* Orbit Tracks for Sacred Vedic Grahas */}
        <div className={styles.orbitTrackOuter} />
        <div className={styles.orbitTrackMiddle} />
        <div className={styles.orbitTrackInner} />

        {/* Astrological Grahas / Planets in Background */}
        {/* Surya / Sun (Center-top radiant sphere) */}
        <div className={`${styles.planet} ${styles.planetSun}`}>
          <div className={styles.sunFlare} />
          <span className={styles.planetPill}>Surya (Sun)</span>
        </div>

        {/* Guru / Jupiter (Upper Right Golden-Striped Giant) */}
        <div className={`${styles.planet} ${styles.planetJupiter}`}>
          <div className={styles.planetAtmosphere} />
          <span className={styles.planetPill}>Guru (Jupiter)</span>
        </div>

        {/* Shani / Saturn (Left with Cosmic Ring) */}
        <div className={`${styles.planet} ${styles.planetSaturn}`}>
          <div className={styles.saturnRing} />
          <div className={styles.planetBody} />
          <span className={styles.planetPill}>Shani (Saturn)</span>
        </div>

        {/* Chandra / Moon (Bottom Left Soft Pearl) */}
        <div className={`${styles.planet} ${styles.planetMoon}`}>
          <div className={styles.moonCraters} />
          <span className={styles.planetPill}>Chandra (Moon)</span>
        </div>

        {/* Mangal / Mars (Upper Left Crimson Warrior Orb) */}
        <div className={`${styles.planet} ${styles.planetMars}`}>
          <div className={styles.marsGlow} />
          <span className={styles.planetPill}>Mangal (Mars)</span>
        </div>

        {/* Shukra / Venus (Center Right Brilliant Luminary) */}
        <div className={`${styles.planet} ${styles.planetVenus}`}>
          <div className={styles.venusGlow} />
          <span className={styles.planetPill}>Shukra (Venus)</span>
        </div>

        {/* Floating Astrological Energy Particles */}
        <div className={styles.sparkleOne}><Sparkles size={18} /></div>
        <div className={styles.sparkleTwo}><Sparkles size={24} /></div>
        <div className={styles.sparkleThree}><Sparkles size={16} /></div>
      </div>

      <div className={styles.wrapper}>
        <div className={styles.heroContentGrid}>
          
          {/* Left Column: Headlines, Trust, and Primary CTAs */}
          <div className={styles.textColumn}>
            <div className={styles.consecrationBadge}>
              <span className={styles.badgePulse} />
              <Sparkles size={14} className={styles.badgeIcon} />
              <span className={styles.badgeText}>108 Gayatri Mantra Energized</span>
            </div>

            <h1 className={styles.heroTitle}>
              Sacred Healing Crystals <br />
              <span className={styles.heroTitleAccent}>Aligned With Your Destiny.</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Authentic certified gemstones energized by Vedic astrologers. Tuned to your 
              Kundli, Mulank, and Chakras to magnetize wealth, dissolve negativity, and invite 
              cosmic blessings into your life.
            </p>

            <div className={styles.actionButtons}>
              <Link href="/shop" className={styles.ctaPrimary}>
                <span>Explore Sacred Collection</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/shop?category=wealth-abundance" className={styles.ctaSecondary}>
                <span>Money Magnet Bracelets</span>
              </Link>
            </div>

            {/* Sacred Energy Elements Bar */}
            <div className={styles.sacredElementsBar}>
              <div className={styles.sacredElementItem}>
                <div className={styles.elementIconWrap}>
                  <Flame size={17} className={styles.elementIcon} />
                </div>
                <div className={styles.elementTextGroup}>
                  <span className={styles.elementTitle}>Vedic Consecration</span>
                  <span className={styles.elementSub}>108 Gayatri Japa</span>
                </div>
              </div>

              <div className={styles.elementDivider} />

              <div className={styles.sacredElementItem}>
                <div className={styles.elementIconWrap}>
                  <Sun size={17} className={styles.elementIcon} />
                </div>
                <div className={styles.elementTextGroup}>
                  <span className={styles.elementTitle}>Planetary Alignment</span>
                  <span className={styles.elementSub}>9 Graha Balancing</span>
                </div>
              </div>

              <div className={styles.elementDivider} />

              <div className={styles.sacredElementItem}>
                <div className={styles.elementIconWrap}>
                  <Moon size={17} className={styles.elementIcon} />
                </div>
                <div className={styles.elementTextGroup}>
                  <span className={styles.elementTitle}>Chakra Resonance</span>
                  <span className={styles.elementSub}>Aura Purification</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: ONLY Sacred Yantra Cosmic Symbol */}
          <div className={styles.visualColumn}>
            <div className={styles.symbolStage}>
              {/* Soft Radial Ambient Aura Glow */}
              <div className={styles.symbolAuraGlow} />

              {/* Outer Slow-Rotating Astrological Sacred Geometry */}
              <div className={styles.outerYantraRing}>
                <svg viewBox="0 0 460 460" className={styles.yantraSvg} fill="none">
                  {/* Outer Concentric Energy Circles */}
                  <circle cx="230" cy="230" r="220" stroke="#560067" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.3" />
                  <circle cx="230" cy="230" r="195" stroke="#D8B878" strokeWidth="1.8" opacity="0.55" />
                  <circle cx="230" cy="230" r="170" stroke="#560067" strokeWidth="1" strokeDasharray="6 8" opacity="0.35" />
                  <circle cx="230" cy="230" r="145" stroke="#D8B878" strokeWidth="1.6" opacity="0.5" />
                  <circle cx="230" cy="230" r="118" stroke="#560067" strokeWidth="1.2" opacity="0.3" />

                  {/* 12 Vedic Solar Petal Orbits */}
                  {[...Array(12)].map((_, i) => (
                    <circle
                      key={i}
                      cx={230 + 170 * Math.cos((i * 30 * Math.PI) / 180)}
                      cy={230 + 170 * Math.sin((i * 30 * Math.PI) / 180)}
                      r="7"
                      fill="#D8B878"
                      opacity="0.65"
                    />
                  ))}

                  {/* Sacred Interlocking Shiva-Shakti Triangles (Sri Yantra) */}
                  <polygon points="230,55 375,315 85,315" stroke="#560067" strokeWidth="1.6" opacity="0.45" />
                  <polygon points="230,405 85,145 375,145" stroke="#D8B878" strokeWidth="1.8" opacity="0.6" />
                  <polygon points="230,85 345,290 115,290" stroke="#D8B878" strokeWidth="1.4" opacity="0.5" />
                  <polygon points="230,375 115,170 345,170" stroke="#560067" strokeWidth="1.4" opacity="0.4" />
                  <polygon points="230,110 320,270 140,270" stroke="#560067" strokeWidth="1.2" opacity="0.35" />
                  <polygon points="230,350 140,190 320,190" stroke="#D8B878" strokeWidth="1.2" opacity="0.45" />
                </svg>
              </div>

              {/* Inner Reverse-Spinning Star Mandala */}
              <div className={styles.innerMandalaRing}>
                <svg viewBox="0 0 280 280" className={styles.yantraSvg} fill="none">
                  <circle cx="140" cy="140" r="130" stroke="#D8B878" strokeWidth="1.2" strokeDasharray="3 5" opacity="0.5" />
                  <rect x="55" y="55" width="170" height="170" stroke="#560067" strokeWidth="1.2" transform="rotate(45 140 140)" opacity="0.35" />
                  <rect x="55" y="55" width="170" height="170" stroke="#D8B878" strokeWidth="1.2" opacity="0.4" />
                </svg>
              </div>

              {/* Consecrated Center Core with REHAS Emblem */}
              <div className={styles.symbolCoreCrest}>
                <div className={styles.symbolCoreRing} />
                <img
                  src={siteConfig.brand.logo}
                  alt="REHAS Sacred Symbol"
                  className={styles.symbolCoreImage}
                />
              </div>

              {/* Elegant Bottom Subtle Alignment Caption */}
              <div className={styles.symbolCaptionPill}>
                <Sparkles size={13} className={styles.captionSparkle} />
                <span>Sri Yantra & Navgrah Energy Alignment</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
