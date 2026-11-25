'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Categories.module.css';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  driveFileId?: string | null;
  description: string | null;
}

interface CategoriesProps {
  categories: CategoryItem[];
}

function resolveCategoryFallback(slug: string, name: string): string {
  const s = (slug + ' ' + name).toLowerCase();
  if (s.includes('astrology') || s.includes('navgraha')) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80';
  }
  if (s.includes('rudraksha')) {
    return 'https://images.unsplash.com/photo-1608248597359-561b369c7308?auto=format&fit=crop&w=400&q=80';
  }
  if (s.includes('yantra') || s.includes('decor')) {
    return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80';
  }
  return 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=400&q=80';
}

export default function Categories({ categories }: CategoriesProps) {
  return (
    <section id="categories" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>Curated Energy Portals</span>
          <h2 className={styles.title}>Shop Bracelets by Cosmic Intent</h2>
          <p className={styles.desc}>
            Select your sacred alignment. Each category is assembled with natural gem beads attuned to specific Chakras and Vedic planetary forces.
          </p>
        </div>

        <div className={styles.grid}>
          {categories.map((cat) => {
            const fallbackSrc = resolveCategoryFallback(cat.slug, cat.name);
            const initialSrc = cat.imageUrl || fallbackSrc;

            return (
              <Link key={cat.id} href={`/shop?category=${cat.slug}`} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img
                    src={initialSrc}
                    alt={cat.name}
                    className={styles.image}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fileId = cat.driveFileId;
                      // Try drive.google.com/thumbnail if lh3 URL or direct link fails
                      if (fileId && !target.src.includes('drive.google.com/thumbnail')) {
                        target.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
                      } else if (target.src !== fallbackSrc) {
                        target.src = fallbackSrc;
                      }
                    }}
                  />
                </div>
                <h3 className={styles.categoryName}>{cat.name}</h3>
                <span className={styles.exploreLink}>Explore Collection →</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
