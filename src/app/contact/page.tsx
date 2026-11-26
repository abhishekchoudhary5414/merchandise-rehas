import React from 'react';
import { Metadata } from 'next';
import { Sparkles, MessageCircle, PhoneCall, Mail } from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import ContactSection from '@/components/contact/ContactSection';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import siteConfig from '@/data/site-config.json';
import styles from './ContactPage.module.css';

export const metadata: Metadata = {
  title: 'Contact Us | REHAS Sacred Merchandise',
  description:
    'Connect with our Vedic guidance team for personalized crystal bracelet consultations, Gotra energization requests, order tracking, and wholesale inquiries.',
};

export default function ContactPage() {
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
                  { label: 'Contact Us', href: '/contact' },
                ]}
              />
            </div>

            <span className={styles.heroBadge}>
              <Sparkles size={13} /> Sacred Patron Support
            </span>
            <h1 className={styles.heroTitle}>Connect with REHAS Sanctuary</h1>
            <p className={styles.heroSubtitle}>
              Reach our Vedic Acharyas and patron support team 24×7 for astrology bracelet recommendations, custom Prana-Pratishtha energization, or order assistance.
            </p>
          </div>
        </section>

        <div className={styles.quickStrip}>
          <a
            href={siteConfig.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.quickCard}
          >
            <div className={styles.quickIcon}>
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 className={styles.quickTitle}>WhatsApp Consultation</h2>
              <p className={styles.quickDesc}>Instant guidance from our astro team</p>
            </div>
          </a>

          <a href={`tel:${siteConfig.contact.rawPhone}`} className={styles.quickCard}>
            <div className={styles.quickIcon}>
              <PhoneCall size={20} />
            </div>
            <div>
              <h2 className={styles.quickTitle}>24×7 Patron Helpline</h2>
              <p className={styles.quickDesc}>{siteConfig.contact.phone}</p>
            </div>
          </a>

          <a href={`mailto:${siteConfig.contact.email}`} className={styles.quickCard}>
            <div className={styles.quickIcon}>
              <Mail size={20} />
            </div>
            <div>
              <h2 className={styles.quickTitle}>Email Sanctum Desk</h2>
              <p className={styles.quickDesc}>{siteConfig.contact.email}</p>
            </div>
          </a>
        </div>

        <ContactSection />
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
