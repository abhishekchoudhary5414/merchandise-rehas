import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  MapPin,
  PhoneCall,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import siteConfig from '@/data/site-config.json';
import WhatsAppFooterLink from '@/components/whatsapp/WhatsAppFooterLink';
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

          {/* Sacred Courses */}
          <div>
            <h4 className={styles.heading}>Sacred Courses</h4>
            <ul className={styles.linkList}>
              <li><a href="https://www.rehas.in/courses/healing" target="_blank" rel="noopener noreferrer">Healing Courses</a></li>
              <li><a href="https://www.rehas.in/courses/therapy" target="_blank" rel="noopener noreferrer">Therapy Courses</a></li>
              <li><a href="https://www.rehas.in/courses/astrology" target="_blank" rel="noopener noreferrer">Astrology Courses</a></li>
              <li><a href="https://www.rehas.in/courses/myt" target="_blank" rel="noopener noreferrer">M.Y.T. Wisdom</a></li>
              <li><a href="https://www.rehas.in/courses/mind-reading" target="_blank" rel="noopener noreferrer">Mind Reading Courses</a></li>
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div>
            <h4 className={styles.heading}>Customer Sanctuary</h4>
            <ul className={styles.linkList}>
              <li><Link href="/about">About Sacred REHAS</Link></li>
              <li><Link href="/blog">Vedic Astrology &amp; Articles</Link></li>
              <li><Link href="/partners">Partners &amp; Canonical Network</Link></li>
              <li><Link href="/track-order">Track Indian Courier Status</Link></li>
              <li><Link href="/privacy-policy">Privacy &amp; Sacred Policy</Link></li>
              <li><Link href="/terms-and-conditions">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Portals & Direct WhatsApp */}
          <div>
            <h4 className={styles.heading}>Connect &amp; Support</h4>
            <ul className={styles.linkList}>
              <li>
                <WhatsAppFooterLink phone={rawPhone}>
                  Chat on WhatsApp ({phoneNumber})
                </WhatsAppFooterLink>
              </li>
              <li><Link href="/account">Patron Account &amp; Orders</Link></li>
              <li><Link href="/admin/dashboard">Store Admin Dashboard</Link></li>
              <li><a href="/sitemap.xml" target="_blank">Dynamic XML Sitemap</a></li>
              <li><a href="/llms.txt" target="_blank">AI Index (llms.txt)</a></li>
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
              Powered by{' '}
              <a
                href="https://www.anksquare.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                www.anksquare.com
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
