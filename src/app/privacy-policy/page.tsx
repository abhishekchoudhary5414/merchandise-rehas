import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  CreditCard,
  Cookie,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import siteConfig from '@/data/site-config.json';
import styles from '@/components/common/PolicyPage.module.css';

export const metadata: Metadata = {
  title: 'Privacy & Sacred Protection Policy | REHAS Sacred Merchandise',
  description:
    'Our sacred pledge to protect patron privacy, birth details, astrological charts, and payment security under the Digital Personal Data Protection (DPDP) Act of India.',
};

const SECTIONS = [
  { id: 'astrology-confidentiality', label: 'Astrological Confidentiality' },
  { id: 'info-collected', label: 'Information We Collect' },
  { id: 'payment-security', label: 'Payment & Banking Security' },
  { id: 'cookies-storage', label: 'Cookies & Local Storage' },
  { id: 'grievance', label: 'Grievance Redressal' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.pageWrap}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        <section className={styles.heroBanner}>
          <div className={styles.heroInner}>
            <div className={styles.breadcrumbWrap}>
              <BreadcrumbNav
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Privacy & Sacred Policy', href: '/privacy-policy' },
                ]}
              />
            </div>

            <span className={styles.heroBadge}>
              <ShieldCheck size={13} /> Patron Data Sanctity
            </span>
            <h1 className={styles.heroTitle}>Privacy &amp; Sacred Data Policy</h1>
            <p className={styles.heroSubtitle}>
              Last Updated: November 2026 · Compliant with the Information Technology Act (2000) and the Digital Personal Data Protection (DPDP) Act of India.
            </p>
          </div>
        </section>

        <div className={styles.contentContainer}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h2 className={styles.sidebarHeading}>On This Page</h2>
              <ul className={styles.tocList}>
                {SECTIONS.map((sec, idx) => (
                  <li key={sec.id}>
                    <a href={`#${sec.id}`} className={styles.tocLink}>
                      <span className={styles.tocNum}>{idx + 1}</span>
                      <span>{sec.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.sidebarCard}>
              <h2 className={styles.sidebarHeading}>Related Policies</h2>
              <div className={styles.relatedLinks}>
                <Link href="/terms-and-conditions" className={styles.relatedLink}>
                  <span>Terms &amp; Conditions</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </aside>

          <article className={styles.policyCard}>
            <section id="astrology-confidentiality" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <Lock size={18} />
                </span>
                <h2 className={styles.sectionTitle}>1. Sacred Confidentiality of Astrological Details</h2>
              </div>
              <p className={styles.paragraph}>
                At <strong>{siteConfig.brand.name} {siteConfig.brand.subName}</strong>, we treat your birth date, birth time, Gotra, birth rashi, and Mulank with the highest spiritual sanctity and confidentiality. Any astrological consultation data provided during energy consecration (<em>Prana Pratishtha</em>) is used exclusively by our Vedic Acharyas to perform authorized Beeja Mantra energization rituals.
              </p>
              <p className={styles.paragraph}>
                Under no circumstances do we rent, license, commercialize, or share your spiritual birth records with third-party advertisers or data brokers.
              </p>
            </section>

            <section id="info-collected" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <UserCheck size={18} />
                </span>
                <h2 className={styles.sectionTitle}>2. Personal Information Collected</h2>
              </div>
              <p className={styles.paragraph}>
                We collect only essential information required to fulfill your sacred order and courier delivery across India:
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Contact Credentials:</strong> Full name, verified Indian mobile phone number, and delivery email address.
                </li>
                <li>
                  <strong>Delivery Destination:</strong> Flat/house number, street/area, nearest landmark, city, state, and 6-digit PIN code.
                </li>
                <li>
                  <strong>Consecration Customization:</strong> Optional Gotra, birth planetary preferences, and personalized sankalpa intent.
                </li>
                <li>
                  <strong>Transactional Audit:</strong> Razorpay transaction IDs, payment status, and generated GSTIN tax invoices.
                </li>
              </ul>
            </section>

            <section id="payment-security" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <CreditCard size={18} />
                </span>
                <h2 className={styles.sectionTitle}>3. Payment Card &amp; Banking Security</h2>
              </div>
              <p className={styles.paragraph}>
                We never store, process, or view your credit card numbers, debit card PINs, CVV codes, or UPI MPINs. All online transactions are processed directly through <strong>Razorpay Payments</strong> utilizing bank-grade 256-Bit SSL encryption complying with RBI regulations and PCI-DSS Level 1 certification.
              </p>
            </section>

            <section id="cookies-storage" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <Cookie size={18} />
                </span>
                <h2 className={styles.sectionTitle}>4. Cookies &amp; Local Storage</h2>
              </div>
              <p className={styles.paragraph}>
                Our platform uses secure HTTP-only session cookies and local storage solely to preserve your active shopping cart, sacred wishlist, authenticated customer session, and postal PIN code verification across devices.
              </p>
            </section>

            <section id="grievance" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <HelpCircle size={18} />
                </span>
                <h2 className={styles.sectionTitle}>5. Grievance Redressal &amp; Contact</h2>
              </div>
              <p className={styles.paragraph}>
                For any data inquiries, erasure requests, or privacy questions, please contact our designated Patron Grievance Officer:
              </p>
              <div className={styles.calloutBox}>
                <p><strong>Grievance Officer:</strong> REHAS Compliance Desk</p>
                <p><strong>Physical Sanctum:</strong> {siteConfig.contact.address.fullAddress}</p>
                <p>
                  <strong>Official Email:</strong>{' '}
                  <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
                </p>
                <p>
                  <strong>Direct Helpline / WhatsApp:</strong>{' '}
                  <a href={`tel:${siteConfig.contact.rawPhone}`}>{siteConfig.contact.phone}</a> ({siteConfig.contact.hours})
                </p>
              </div>
            </section>
          </article>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
