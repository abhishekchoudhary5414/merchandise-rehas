import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import { Sparkles, Calendar, User, ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import styles from './BlogList.module.css';

export const revalidate = 60; // Revalidate every minute

export const metadata = {
  title: 'Vedic Astrology & Energy Articles | REHAS Merchandise',
  description: 'Explore ancient Vedic wisdom, gemstone energy secrets, consecration rituals, and planetary alignments curated by Astro Acharyas at REHAS.',
};

const DEFAULT_BLOGS = [
  {
    id: 'default-1',
    title: 'How Consecrated Gemstone Bracelets Balance Your 7 Chakras',
    slug: 'consecrated-gemstone-bracelets-balance-chakras',
    summary: 'Discover how authentic energized crystals harmonize bodily prana, ground anxious energy, and align with your planetary chart.',
    content: 'Full guide exploring Chakra alignments and gemstone frequencies.',
    imageUrl: 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80',
    author: 'Astro Acharya - REHAS',
    tags: 'Chakra Healing, Vedic Crystals',
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'default-2',
    title: 'The Vedic Science of Rudraksha & Silver Energy Consecration',
    slug: 'vedic-science-rudraksha-silver-consecration',
    summary: 'Why metal purity and Vedic mantras awaken the hidden electromagnetic frequency of sacred seeds and natural gemstones.',
    content: 'Full guide exploring Rudraksha sanctification and energy retention.',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    author: 'Pandit Dev Sharma',
    tags: 'Rudraksha, Consecration',
    createdAt: new Date('2025-02-01'),
  },
  {
    id: 'default-3',
    title: 'Choosing Your Sacred Bracelet by Zodiac Sign & Nakshatra',
    slug: 'choosing-sacred-bracelet-by-zodiac-nakshatra',
    summary: 'A step-by-step astrological roadmap to wearing the exact gemstone suited for your birth moon chart and planetary dasha.',
    content: 'Detailed breakdown of the 12 Rashi signs and their ideal healing crystals.',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    author: 'Astro Acharya - REHAS',
    tags: 'Zodiac, Planetary Crystals',
    createdAt: new Date('2025-02-20'),
  }
];

export default async function BlogListingPage() {
  let blogs: any[] = [];

  try {
    const dbBlogs = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    blogs = dbBlogs.length > 0 ? dbBlogs : DEFAULT_BLOGS;
  } catch (err) {
    console.error('Error fetching blogs in BlogListingPage:', err);
    blogs = DEFAULT_BLOGS;
  }

  const featuredBlog = blogs[0];
  const regularBlogs = blogs.slice(1);

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        {/* Header Hero */}
        <section className={styles.heroHeader}>
          <div className={styles.tagline}>
            <Sparkles size={14} />
            <span>Vedic Wisdom & Consecration Insights</span>
          </div>
          <h1 className={styles.title}>Sacred Energy Articles & Astrological Guides</h1>
          <p className={styles.subtitle}>
            Deep dive into the metaphysical sciences of energized crystals, Rudraksha sanctification, 
            planetary transits, and daily pranic rituals curated by our Vedic Acharyas.
          </p>
        </section>

        {/* Featured Blog (Hero Card) */}
        {featuredBlog && (
          <section style={{ marginBottom: '40px' }}>
            <Link href={`/blog/${featuredBlog.slug}`} style={{ textDecoration: 'none' }}>
              <div 
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1.5px solid rgba(86, 0, 103, 0.14)',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  boxShadow: '0 8px 30px rgba(86, 0, 103, 0.06)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
              >
                <div style={{ position: 'relative', minHeight: '300px', width: '100%' }}>
                  <img
                    src={featuredBlog.imageUrl}
                    alt={featuredBlog.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      maxHeight: '420px',
                    }}
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: 'linear-gradient(135deg, #560067 0%, #3B0047 100%)',
                      color: '#D8B878',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Featured Article</span>
                  </div>
                </div>

                <div 
                  style={{
                    padding: '36px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      marginBottom: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <User size={13} style={{ color: 'var(--primary)' }} />
                      <strong>{featuredBlog.author}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={13} style={{ color: 'var(--primary)' }} />
                      {new Date(featuredBlog.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {featuredBlog.tags && (
                      <span 
                        style={{
                          background: 'rgba(86,0,103,0.06)',
                          color: '#560067',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        {featuredBlog.tags.split(',')[0]}
                      </span>
                    )}
                  </div>

                  <h2 
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(22px, 2.5vw, 30px)',
                      fontWeight: 800,
                      color: '#560067',
                      lineHeight: '1.3',
                      marginBottom: '14px',
                    }}
                  >
                    {featuredBlog.title}
                  </h2>

                  <p 
                    style={{
                      fontSize: '14.5px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.65',
                      marginBottom: '24px',
                    }}
                  >
                    {featuredBlog.summary}
                  </p>

                  <div 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#560067',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    <span>Read Complete Sacred Guide</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Regular Grid */}
        <section>
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              borderBottom: '1px solid rgba(86, 0, 103, 0.1)',
              paddingBottom: '12px',
            }}
          >
            <h2 
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '22px',
                color: '#560067',
                margin: 0,
                fontWeight: 700,
              }}
            >
              Latest Sacred Publications
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {blogs.length} {blogs.length === 1 ? 'article' : 'articles'}
            </span>
          </div>

          <div className={styles.grid}>
            {blogs.map((b) => (
              <Link href={`/blog/${b.slug}`} key={b.id} className={styles.card}>
                <div className={styles.imageWrap}>
                  <img src={b.imageUrl} alt={b.title} className={styles.image} />
                  {b.tags && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(86, 0, 103, 0.85)',
                        backdropFilter: 'blur(4px)',
                        color: '#FFFFFF',
                        padding: '3px 9px',
                        borderRadius: '999px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {b.tags.split(',')[0]}
                    </span>
                  )}
                </div>

                <div className={styles.content}>
                  <div className={styles.meta}>
                    <span className={styles.metaItem}>
                      <User size={12} />
                      {b.author}
                    </span>
                    <span className={styles.metaItem}>
                      <Calendar size={12} />
                      {new Date(b.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>{b.title}</h3>
                  <p className={styles.summary}>{b.summary}</p>

                  <div className={styles.readMore}>
                    <span>Read Full Guide</span>
                    <ArrowRight size={14} className={styles.arrow} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
