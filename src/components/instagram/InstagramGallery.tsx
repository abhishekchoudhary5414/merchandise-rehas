import React from 'react';
import { Camera } from 'lucide-react';
import styles from './InstagramGallery.module.css';

export default function InstagramGallery() {
  const images = [
    'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80',
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>Sacred Lifestyle</span>
          <h2 className={styles.title}>Join Our Celestial Tribe @rehas.in</h2>
          <p className={styles.desc}>
            Tag #REHASSacredMerchandise to be featured in our cosmic sanctuary gallery.
          </p>
        </div>

        <div className={styles.gallery}>
          {images.map((src, idx) => (
            <a
              key={idx}
              href="https://www.instagram.com/rehas.in"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.imageCard}
            >
              <img src={src} alt={`REHAS Community Bracelet ${idx + 1}`} className={styles.image} />
              <div className={styles.overlay}>
                <Camera size={26} className={styles.instaIcon} />
                <span className={styles.viewText}>View on Instagram</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
