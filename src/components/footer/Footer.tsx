import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  MapPin,
  PhoneCall,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import siteConfig from '@/data/site-config.json';
import styles from './Footer.module.css';

export default function Footer() {
  const fullAddress = 'REHAS, Chanakya Nagar Road, Agam Kua, Patna, Bihar, India - 800007';
  const phoneNumber = '+91 9517973153';
  const rawPhone = '919517973153';
  const hours = '24 Hours (Always Available)';

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand & Address Column */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <div className={styles.logoImageWrap}>
                <Image
                  src={siteConfig.brand.logo}
                  alt={`${siteConfig.brand.name} Emblem`}
                  width={44}
                  height={44}
                  className={styles.logoImg}
                />
              </div>
              <div className={styles.logoTextCol}>
                <span className={styles.logoMain}>{siteConfig.brand.name}</span>
                <span className={styles.logoSub}>
                  <Sparkles size={11} className={styles.sparkle} /> {siteConfig.brand.subName}
                </span>
              </div>
            </div>

            <p className={styles.brandDesc}>
              {siteConfig.brand.description}
            </p>

            {/* Redesigned Contact & Physical Address Box */}
            <div className={styles.contactCard}>
              {/* Physical Location */}
              <div className={styles.contactRow}>
                <MapPin size={17} className={styles.contactIcon} />
                <div className={styles.contactText}>
                  <span className={styles.contactLabel}>Consecrated Atelier &amp; Center:</span>
                  <span className={styles.contactVal}>{fullAddress}</span>
                </div>
              </div>

              {/* Phone & WhatsApp Contact */}
              <div className={styles.contactRow}>
                <PhoneCall size={17} className={styles.contactIcon} />
                <div className={styles.contactText}>
                  <span className={styles.contactLabel}>Patron Helpline &amp; Astro WhatsApp:</span>
                  <a href={`tel:${phoneNumber}`} className={styles.contactLink}>
                    {phoneNumber}
                  </a>
                </div>
              </div>

              {/* Availability Hours */}
              <div className={styles.contactRow}>
                <Clock size={17} className={styles.contactIcon} />
                <div className={styles.contactText}>
                  <span className={styles.contactLabel}>Operating Hours:</span>
                  <span className={styles.hoursPill}>
                    <CheckCircle2 size={12} />
                    <span>{hours}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sacred Categories */}
          <div>
            <h4 className={styles.heading}>Sacred Categories</h4>
            <ul className={styles.linkList}>
              <li><Link href="/shop?category=wealth-abundance">Money Magnet Bracelets</Link></li>
              <li><Link href="/shop?category=planetary-navgrah">Navgrah &amp; Planetary Kadas</Link></li>
              <li><Link href="/shop?category=evil-eye-nazar-suraksha">Sulemani Hakik Nazar Shield</Link></li>
              <li><Link href="/shop?category=numerology-mulank">Mulank 1 to 9 Remedies</Link></li>
              <li><Link href="/shop?category=love-harmony-venus">Venus &amp; Heart Chakra Stones</Link></li>
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div>
            <h4 className={styles.heading}>Customer Sanctuary</h4>
            <ul className={styles.linkList}>
              <li><Link href="/blog">Vedic Astrology &amp; Articles</Link></li>
              <li><Link href="/track-order">Track Indian Courier Status</Link></li>
              <li><Link href="/shipping-policy">Shipping &amp; Delivery Rates</Link></li>
              <li><Link href="/returns-refunds">7-Day Doorstep Returns</Link></li>
              <li><Link href="/privacy-policy">Privacy &amp; Sacred Policy</Link></li>
              <li><Link href="/terms-and-conditions">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Portals & Direct WhatsApp */}
          <div>
            <h4 className={styles.heading}>Connect &amp; Support</h4>
            <ul className={styles.linkList}>
              <li>
                <a
                  href={`https://wa.me/${rawPhone}?text=Pranam%20REHAS%20Team!%20I%20would%20like%20guidance%20on%20choosing%20the%20right%20energized%20astrology%20crystal%20bracelet.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#4ADE80', fontWeight: 700 }}
                >
                  Chat on WhatsApp ({phoneNumber})
                </a>
              </li>
              <li><Link href="/account">Patron Account &amp; Orders</Link></li>
              <li><Link href="/admin/dashboard">Store Admin Dashboard</Link></li>
              <li><a href="/sitemap.xml" target="_blank">Dynamic XML Sitemap</a></li>
              <li><a href="/api/feeds/google-merchant" target="_blank">Google Merchant Feed</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p>
            © {new Date().getFullYear()} {siteConfig.brand.name} {siteConfig.brand.subName}. All rights reserved. Consecrated in Patna, Bihar, India.
          </p>
          <div className={styles.badges}>
            <span className={styles.badgeItem}>
              <Lock size={12} /> Razorpay 256-Bit SSL
            </span>
            <span>•</span>
            <span className={styles.badgeItem}>
              <Truck size={12} /> Shiprocket Pan-India
            </span>
            <span>•</span>
            <span className={styles.badgeItem}>
              <ShieldCheck size={12} /> Certified Natural Crystals
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
