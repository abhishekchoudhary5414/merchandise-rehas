import React from 'react';
import Link from 'next/link';
import styles from './Categories.module.css';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
}

interface CategoriesProps {
  categories: CategoryItem[];
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
          {categories.map((cat) => (
            <Link key={cat.id} href={`/shop?category=${cat.slug}`} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=400&q=80'}
                  alt={cat.name}
                  className={styles.image}
                />
              </div>
              <h3 className={styles.categoryName}>{cat.name}</h3>
              <span className={styles.exploreLink}>Explore Collection →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
