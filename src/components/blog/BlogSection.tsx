import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import styles from './BlogSection.module.css';

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string;
  author: string;
  createdAt: Date;
}

interface BlogSectionProps {
  blogs: BlogItem[];
}

export default function BlogSection({ blogs }: BlogSectionProps) {
  return (
    <section id="blog" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>Sacred Astrology Wisdom</span>
          <h2 className={styles.title}>Vedic Crystal Knowledge & Rituals</h2>
        </div>

        <div className={styles.grid}>
          {blogs.map((b) => (
            <div key={b.id} className={styles.card}>
              <div className={styles.imageWrap}>
                <img src={b.imageUrl} alt={b.title} className={styles.image} />
              </div>

              <div className={styles.content}>
                <div className={styles.meta}>
                  <span><User size={12} /> {b.author}</span>
                  <span><Calendar size={12} /> {new Date(b.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <h3 className={styles.blogTitle}>{b.title}</h3>
                <p className={styles.summary}>{b.summary}</p>

                <Link href={`/blog/${b.slug}`} className={styles.readMore}>
                  Read Sacred Guide <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
