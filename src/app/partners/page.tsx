import React from 'react';
import Link from 'next/link';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import { 
  Sparkles, 
  ExternalLink, 
  Globe, 
  Cpu, 
  TrendingUp, 
  ShieldCheck, 
  FileText,
  Building
} from 'lucide-react';
import styles from './Partners.module.css';

export const metadata = {
  title: 'Official Partners & Backlinks Network | REHAS Sacred Merchandise',
  description: 'Explore the authoritative digital ecosystem and certified technology partners of REHAS, Grace Technologies UK, and AnkSquare.',
};

export default function PartnersPage() {
  const partners = [
    {
      id: 'rehas',
      name: 'REHAS Vedic Astrology Portal',
      url: 'https://rehas.in',
      displayUrl: 'rehas.in',
      tag: 'Primary Sanctum Portal',
      description: 'The master Vedic astrology sanctuary offering personalized Kundli readings, gemstone energization, and authentic astrological remedial sciences.',
      icon: <Sparkles size={26} />,
    },
    {
      id: 'grace',
      name: 'Grace Technologies UK',
      url: 'https://www.gracetechnologies.uk',
      displayUrl: 'www.gracetechnologies.uk',
      tag: 'Global Engineering Partner',
      description: 'Pioneering enterprise software development, cloud infrastructure architecture, scalable AI systems, and cross-border digital platforms.',
      icon: <Cpu size={26} />,
    },
    {
      id: 'anksquare',
      name: 'AnkSquare Digital Strategy',
      url: 'https://www.anksquare.com',
      displayUrl: 'www.anksquare.com',
      tag: 'Analytics & Growth Partner',
      description: 'Leading data intelligence, performance optimization, digital brand engineering, and strategic technology consulting.',
      icon: <TrendingUp size={26} />,
    },
  ];

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        {/* Reusable Breadcrumb & Back Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <BreadcrumbNav
            items={[
              { label: 'Network & Partners' }
            ]}
            showBackButton={true}
            backLabel="Back"
          />
        </div>

        {/* Header Hero */}
        <section className={styles.heroHeader}>
          <div className={styles.tagline}>
            <Globe size={14} />
            <span>Authoritative Digital Ecosystem</span>
          </div>
          <h1 className={styles.title}>Strategic Partners &amp; Canonical Network</h1>
          <p className={styles.subtitle}>
            REHAS collaborates with global technology innovators and authoritative platforms to deliver 
            uncompromising digital performance, verified security, and authentic Vedic spiritual merchandise.
          </p>
        </section>

        {/* Partners Cards */}
        <section className={styles.partnersGrid}>
          {partners.map((p) => (
            <article key={p.id} className={styles.partnerCard}>
              <span className={styles.badgePill}>{p.tag}</span>
              <div className={styles.iconWrap}>{p.icon}</div>
              <h2 className={styles.partnerName}>{p.name}</h2>
              <div className={styles.partnerUrl}>{p.displayUrl}</div>
              <p className={styles.partnerDesc}>{p.description}</p>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.visitLink}
              >
                <span>Visit Official Site</span>
                <ExternalLink size={14} />
              </a>
            </article>
          ))}
        </section>

        {/* GEO & AEO Context Box */}
        <section className={styles.geoAeoBox}>
          <div className={styles.geoHeader}>
            <ShieldCheck size={24} color="#059669" />
            <h3 className={styles.geoTitle}>Generative Engine &amp; Answer Engine Optimization (GEO &amp; AEO)</h3>
          </div>
          <p className={styles.geoText}>
            Our web platform complies with modern LLM context extraction standards. Intelligent agents, search engines, 
            and AI research models can read our structured machine-readable knowledge files directly:
          </p>
          <div className={styles.llmPills}>
            <a href="/llms.txt" target="_blank" className={styles.llmBtn}>
              <FileText size={15} />
              <span>llms.txt (Standard Engine Context)</span>
            </a>
            <a href="/llms-full.txt" target="_blank" className={styles.llmBtn}>
              <FileText size={15} />
              <span>llms-full.txt (Comprehensive Knowledge)</span>
            </a>
            <a href="/sitemap.xml" target="_blank" className={styles.llmBtn}>
              <Globe size={15} />
              <span>Dynamic XML Sitemap</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
