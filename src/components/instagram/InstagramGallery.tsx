import React from 'react';
import { Camera } from 'lucide-react';
import styles from './InstagramGallery.module.css';

export default function InstagramGallery() {
  const images = [
    { src: '/images/gallery/bracelet-1.jpg', alt: 'Tiger Eye Crystal Bracelet' },
    { src: '/images/gallery/bracelet-2.jpg', alt: 'Natural Amethyst Crystal Bracelet' },
    { src: '/images/gallery/bracelet-3.jpg', alt: 'Pyrite & Citrine Money Magnet Bracelet' },
    { src: '/images/gallery/bracelet-4.jpg', alt: 'Rose Quartz Heart Chakra Bracelet' },
    { src: '/images/gallery/bracelet-5.jpg', alt: 'Sulemani Hakik & Black Obsidian Shield Bracelet' },
    { src: '/images/gallery/bracelet-6.jpg', alt: '7-Chakra & Rudraksha Consecrated Bracelet' },
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
          {images.map((item, idx) => (
            <a
              key={idx}
              href="https://www.instagram.com/rehas.in"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.imageCard}
            >
              <img src={item.src} alt={item.alt} className={styles.image} />
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
