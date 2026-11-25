import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import siteConfig from '@/data/site-config.json';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Col */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <div className={styles.logoImageWrap}>
                <Image
                  src={siteConfig.brand.logo}
                  alt={`${siteConfig.brand.name} Emblem`}
                  width={42}
                  height={42}
                  className={styles.logoImg}
                />
              </div>
              <div className={styles.logoTextCol}>
                <span className={styles.logoMain}>{siteConfig.brand.name}</span>
                <span className={styles.logoSub}>
                  <Sparkles size={10} className={styles.sparkle} /> {siteConfig.brand.subName}
                </span>
              </div>
            </div>
            
            <p className={styles.brandDesc}>
              {siteConfig.brand.description}
            </p>

            <div className={styles.contactDetails}>
              <div><strong>Atelier:</strong> {siteConfig.contact.address.fullAddress}</div>
              <div><strong>Helpline:</strong> {siteConfig.contact.phone} ({siteConfig.contact.hours})</div>
              <div><strong>Support:</strong> {siteConfig.contact.email}</div>
              <div className={styles.taxInfo}>GSTIN: {siteConfig.brand.gstin}</div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.heading}>Sacred Categories</h4>
            <ul className={styles.linkList}>
              <li><Link href="/shop?category=wealth-abundance">Money Magnet Bracelets</Link></li>
              <li><Link href="/shop?category=planetary-navgrah">Navgrah & Planetary Kadas</Link></li>
              <li><Link href="/shop?category=evil-eye-nazar-suraksha">Sulemani Hakik Nazar Shield</Link></li>
              <li><Link href="/shop?category=numerology-mulank">Mulank 1 to 9 Remedies</Link></li>
              <li><Link href="/shop?category=love-harmony-venus">Venus & Heart Chakra Stones</Link></li>
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div>
            <h4 className={styles.heading}>Customer Sanctuary</h4>
            <ul className={styles.linkList}>
              <li><Link href="/track-order">Track Indian Courier Status</Link></li>
              <li><Link href="/shipping-policy">Shipping & Delivery Rates</Link></li>
              <li><Link href="/returns-refunds">7-Day Doorstep Returns</Link></li>
              <li><Link href="/privacy-policy">Privacy & Sacred Policy</Link></li>
              <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Admin & Portals */}
          <div>
            <h4 className={styles.heading}>Admin & Feeds</h4>
            <ul className={styles.linkList}>
              <li><Link href="/admin/dashboard">Store Admin Dashboard</Link></li>
              <li><a href="/sitemap.xml" target="_blank">Dynamic XML Sitemap</a></li>
              <li><a href="/api/feeds/google-merchant" target="_blank">Google Merchant Feed</a></li>
              <li><Link href="/#contact">Astrologer Consultation</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>© {new Date().getFullYear()} {siteConfig.brand.name} {siteConfig.brand.subName}. All rights reserved. Prices in INR (₹) inclusive of GST.</p>
          <div className={styles.badges}>
            <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.85 }}>Store Admin</Link>
            <span>•</span>
            <span>Razorpay 256-Bit SSL</span>
            <span>•</span>
            <span>Shiprocket Pan-India</span>
            <span>•</span>
            <span>Certified Gemstones</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
