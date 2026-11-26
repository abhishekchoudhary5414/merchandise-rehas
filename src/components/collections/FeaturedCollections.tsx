import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import styles from './FeaturedCollections.module.css';

interface CourseItem {
  title: string;
  subtitle: string;
  image: string;
  tag: string;
  link: string;
}

const COURSES: CourseItem[] = [
  {
    title: 'Healing Courses',
    subtitle: 'Channel divine energy from foundational Reiki to Grand Master, Angel Blessing & Lama Fera.',
    image: '/images/courses/healing.jpg',
    tag: 'Reiki · Angel · Lama Fera',
    link: 'https://www.rehas.in/courses/healing',
  },
  {
    title: 'Therapy Courses',
    subtitle: 'Professional certification in holistic Acupressure, Magnet Therapy & Vedic Marma Therapy.',
    image: '/images/courses/therapy.jpg',
    tag: 'Acupressure · Magnet · Marma',
    link: 'https://www.rehas.in/courses/therapy',
  },
  {
    title: 'Astrology Courses',
    subtitle: 'Decode cosmic blueprints with Vedic Astrology, Numerology, Tarot Reading & Palmistry.',
    image: '/images/courses/astrology.jpg',
    tag: 'Vedic · Numerology · Tarot',
    link: 'https://www.rehas.in/courses/astrology',
  },
  {
    title: 'M.Y.T. Wisdom',
    subtitle: 'Explore sacred geometry, beeja mantra mechanics, Yantra energization & Tantra alignment.',
    image: '/images/courses/myt.jpg',
    tag: 'Mantra · Yantra · Tantra',
    link: 'https://www.rehas.in/courses/myt',
  },
  {
    title: 'Mind Reading Courses',
    subtitle: 'Awaken mid-brain activation, intuitive perception, Law of Attraction & manifestation.',
    image: '/images/courses/mind-reading.jpg',
    tag: 'Intuition · Manifestation',
    link: 'https://www.rehas.in/courses/mind-reading',
  },
];

export default function FeaturedCollections() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>
            <Sparkles size={13} /> REHAS Sacred Academy
          </span>
          <h2 className={styles.title}>Sacred Wisdom &amp; Healing Courses</h2>
          <p className={styles.description}>
            Deepen your spiritual mastery with certified courses on REHAS — from energy healing and holistic therapy to Vedic astrology.
          </p>
        </div>

        <div className={styles.grid}>
          {COURSES.map((course, idx) => (
            <a
              key={course.link}
              href={course.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.card} ${idx < 2 ? styles.cardWide : styles.cardStandard}`}
            >
              <div className={styles.imageWrapper}>
                <img src={course.image} alt={course.title} className={styles.image} />
                <div className={styles.overlay} />
              </div>
              <div className={styles.cardContent}>
                <span className={styles.tag}>{course.tag}</span>
                <h3 className={styles.cardTitle}>{course.title}</h3>
                <p className={styles.cardSubtitle}>{course.subtitle}</p>
                <span className={styles.linkText}>
                  Explore Course <ArrowUpRight size={14} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
