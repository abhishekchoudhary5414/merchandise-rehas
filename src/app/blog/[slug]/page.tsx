import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import { 
  Sparkles, 
  Calendar, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Share2, 
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import styles from './BlogDetail.module.css';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_BLOGS: Record<string, any> = {};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  let blog: any = null;

  try {
    blog = await prisma.blog.findUnique({
      where: { slug },
    });
  } catch (err) {
    // fallback
  }

  if (!blog && DEFAULT_BLOGS[slug]) {
    blog = DEFAULT_BLOGS[slug];
  }

  if (!blog) {
    return {
      title: 'Article Not Found | REHAS',
      description: 'The requested Vedic wisdom article could not be located.',
    };
  }

  return {
    title: `${blog.title} | REHAS Vedic Wisdom`,
    description: blog.summary,
    openGraph: {
      title: blog.title,
      description: blog.summary,
      images: [blog.imageUrl],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let blog: any = null;

  try {
    blog = await prisma.blog.findUnique({
      where: { slug },
    });
  } catch (err) {
    console.error('Error fetching blog detail:', err);
  }

  if (!blog && DEFAULT_BLOGS[slug]) {
    blog = DEFAULT_BLOGS[slug];
  }

  if (!blog) {
    notFound();
  }

  const tagsList = blog.tags ? blog.tags.split(',').map((t: string) => t.trim()) : ['Vedic Wisdom'];

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href="/blog">Vedic Articles</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{blog.title}</span>
        </nav>

        {/* Main Article Document */}
        <article className={styles.articleCard}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <div className={styles.tagRow}>
              {tagsList.map((tag: string, idx: number) => (
                <span key={idx} className={styles.tagBadge}>
                  <Tag size={12} />
                  <span>{tag}</span>
                </span>
              ))}
              <span className={styles.consecrationBadge}>
                <Sparkles size={12} />
                <span>Vedic Authenticated</span>
              </span>
            </div>

            <h1 className={styles.articleTitle}>{blog.title}</h1>

            <p className={styles.articleSummary}>{blog.summary}</p>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <User size={15} style={{ color: 'var(--primary)' }} />
                <span>By <strong>{blog.author}</strong></span>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={15} style={{ color: 'var(--primary)' }} />
                <span>
                  Published on{' '}
                  {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className={styles.metaItem}>
                <ShieldCheck size={15} style={{ color: '#059669' }} />
                <span style={{ color: '#059669', fontWeight: 600 }}>Consecrated Knowledge</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className={styles.imageWrap}>
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className={styles.heroImage}
            />
          </div>

          {/* Article Full Content */}
          <div className={styles.contentBody}>
            {blog.content ? (
              blog.content.split('\n\n').map((para: string, idx: number) => {
                const trimmed = para.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 
                      key={idx} 
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '22px',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        marginTop: '32px',
                        marginBottom: '14px',
                      }}
                    >
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }

                if (trimmed.startsWith('- ')) {
                  const items = trimmed.split('\n');
                  return (
                    <ul 
                      key={idx} 
                      style={{ 
                        paddingLeft: '22px', 
                        marginBottom: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {items.map((it, i) => (
                        <li key={i} style={{ color: '#333' }}>
                          {it.replace(/^- /, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }

                if (/^\d+\.\s/.test(trimmed)) {
                  const items = trimmed.split('\n');
                  return (
                    <ol 
                      key={idx} 
                      style={{ 
                        paddingLeft: '22px', 
                        marginBottom: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {items.map((it, i) => (
                        <li key={i} style={{ color: '#333' }}>
                          {it.replace(/^\d+\.\s/, '')}
                        </li>
                      ))}
                    </ol>
                  );
                }

                return (
                  <p key={idx} className={styles.paragraph}>
                    {trimmed}
                  </p>
                );
              })
            ) : (
              <p className={styles.paragraph}>{blog.summary}</p>
            )}

            {/* Vedic Consecration Callout */}
            <div className={styles.consecrationCallout}>
              <Sparkles size={24} className={styles.calloutIcon} />
              <div>
                <h4 className={styles.calloutTitle}>Vedic Sanctification Guarantee</h4>
                <p className={styles.calloutText}>
                  Every gemstone and Rudraksha bracelet created by REHAS is consecrated in our Patna Vedic sanctum
                  with sacred Ganga jal, Panchamrit, and 108 Beej Mantra recitations. Wear your sacred jewel with reverent
                  intentions to manifest peace, protection, and planetary alignment.
                </p>
              </div>
            </div>

            {/* Shop CTA Box */}
            <div className={styles.shopCtaBox}>
              <div>
                <h3 className={styles.ctaHeading}>Align Your Prana with Sacred Crystals</h3>
                <p className={styles.ctaSub}>
                  Explore authentic certified gemstones hand-strung and energized by our Acharyas for your specific zodiac and intention.
                </p>
              </div>
              <Link href="/shop" className={styles.ctaBtn}>
                <ShoppingBag size={16} />
                <span>Explore Sacred Collection</span>
              </Link>
            </div>
          </div>
        </article>

        {/* Back Link */}
        <div className={styles.backRow}>
          <Link href="/blog" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Return to All Articles</span>
          </Link>
          <Link href="/shop" className={styles.backBtn}>
            <span>View Consecrated Bracelets</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
