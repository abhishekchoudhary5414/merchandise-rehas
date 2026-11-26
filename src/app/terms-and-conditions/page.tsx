import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Scale,
  FileText,
  Sparkles,
  IndianRupee,
  Truck,
  RotateCcw,
  Landmark,
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
  title: 'Terms & Conditions | REHAS Sacred Merchandise',
  description:
    'Patron terms and conditions for ordering consecrated Vedic crystal bracelets, energization rituals, delivery timelines, and jurisdictional governance.',
};

const SECTIONS = [
  { id: 'agreement', label: 'Agreement to Terms' },
  { id: 'consecration', label: 'Vedic Consecration & Crystals' },
  { id: 'pricing', label: 'Pricing & GST Compliance' },
  { id: 'shipping', label: 'Shipping & Doorstep Delivery' },
  { id: 'returns', label: 'Returns & Damage Claims' },
  { id: 'jurisdiction', label: 'Governing Law & Jurisdiction' },
];

export default function TermsAndConditionsPage() {
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
                  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
                ]}
              />
            </div>

            <span className={styles.heroBadge}>
              <Scale size={13} /> Legal &amp; Spiritual Agreement
            </span>
            <h1 className={styles.heroTitle}>Terms &amp; Sacred Conditions</h1>
            <p className={styles.heroSubtitle}>
              Effective Date: November 2026 · Governed by the laws of the Republic of India and the exclusive jurisdiction of Patna Courts, Bihar.
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
                <Link href="/privacy-policy" className={styles.relatedLink}>
                  <span>Privacy &amp; Sacred Policy</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </aside>

          <article className={styles.policyCard}>
            <section id="agreement" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <FileText size={18} />
                </span>
                <h2 className={styles.sectionTitle}>1. Agreement to Terms</h2>
              </div>
              <p className={styles.paragraph}>
                By visiting, browsing, or purchasing consecrated merchandise from{' '}
                <strong>{siteConfig.brand.name} {siteConfig.brand.subName}</strong> (hereinafter referred to as &ldquo;REHAS&rdquo;, &ldquo;we&rdquo;, or &ldquo;our&rdquo;), you agree to be bound by these Terms and Conditions, our{' '}
                <Link href="/privacy-policy">Privacy Policy</Link>, and our 7-Day Doorstep Replacement Guidelines.
              </p>
            </section>

            <section id="consecration" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <Sparkles size={18} />
                </span>
                <h2 className={styles.sectionTitle}>2. Nature of Vedic Consecration &amp; Crystals</h2>
              </div>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Natural Mineral Inclusions:</strong> Every crystal bracelet is assembled using 100% genuine earth-mined stones (Pyrite, Sulemani Hakik, Citrine, Tiger Eye, Amethyst, etc.). Natural inclusions, slight color shifts, and minor bead variations are inherent signs of authentic natural formation and are not defects.
                </li>
                <li>
                  <strong>Spiritual Energization (Prana Pratishtha):</strong> Items undergo purification with holy Ganga Jal and planetary beeja mantra activation in our Patna sanctum. While rooted in classical Vedic traditions, crystal energy and astrological remedies are spiritual aids and do not substitute for licensed medical, psychological, financial, or legal advice.
                </li>
              </ul>
            </section>

            <section id="pricing" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <IndianRupee size={18} />
                </span>
                <h2 className={styles.sectionTitle}>3. Pricing &amp; GST Compliance</h2>
              </div>
              <p className={styles.paragraph}>
                All prices are stated in Indian Rupees (INR, ₹). In compliance with Indian tax statutes, prices shown are MRP inclusive of applicable Goods and Services Tax (GST) under GSTIN <strong>{siteConfig.brand.gstin}</strong>. Complimentary express shipping applies on eligible orders above our free-shipping threshold across all serviceable Indian PIN codes.
              </p>
            </section>

            <section id="shipping" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <Truck size={18} />
                </span>
                <h2 className={styles.sectionTitle}>4. Shipping &amp; Doorstep Delivery</h2>
              </div>
              <p className={styles.paragraph}>
                Orders are ritually consecrated and dispatched within 24 to 48 business hours from our sanctum in Patna, Bihar. Consignments are handled by premier Indian logistics partners. Delivery typically arrives within 2–5 business days depending on your destination PIN code.
              </p>
            </section>

            <section id="returns" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <RotateCcw size={18} />
                </span>
                <h2 className={styles.sectionTitle}>5. Returns &amp; Damage Claim Policy</h2>
              </div>
              <p className={styles.paragraph}>
                We offer a 7-day doorstep replacement window for any piece that arrives damaged, defective, or incorrect during transit. To preserve spiritual sanctity, items must remain unused and in their original packaging.
              </p>
              <div className={styles.calloutBox}>
                <p>
                  <strong>Need to report a transit issue?</strong> Share unboxing/parcel photos within 48 hours of delivery:
                </p>
                <p>
                  Helpline / WhatsApp: <a href={`tel:${siteConfig.contact.rawPhone}`}>{siteConfig.contact.phone}</a> · Email:{' '}
                  <a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>
                </p>
              </div>
            </section>

            <section id="jurisdiction" className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <Landmark size={18} />
                </span>
                <h2 className={styles.sectionTitle}>6. Governing Law &amp; Jurisdiction</h2>
              </div>
              <p className={styles.paragraph}>
                These Terms shall be interpreted and enforced strictly in accordance with the laws of the Republic of India. In the event of any legal dispute, courts situated exclusively in <strong>{siteConfig.contact.address.city}, {siteConfig.contact.address.state}, {siteConfig.contact.address.country}</strong> shall have sole jurisdiction.
              </p>
            </section>
          </article>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
