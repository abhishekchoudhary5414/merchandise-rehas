import React from 'react';
import { Gem, ShieldCheck, Flame, Truck, Headphones, CheckCircle2 } from 'lucide-react';
import styles from './WhyUs.module.css';

export default function WhyUs() {
  const pillars = [
    {
      icon: <Gem size={26} />,
      title: 'Lab-Certified Crystals',
      desc: '100% natural, unheated, undyed gemstone beads verified for genuine piezoelectric frequencies.',
    },
    {
      icon: <Flame size={26} />,
      title: 'Vedic Mantra Energization',
      desc: 'Every bracelet undergoes consecrated purification rituals, beeja mantra jaap, and moonlight charging.',
    },
    {
      icon: <ShieldCheck size={26} />,
      title: 'Astrology Alignment',
      desc: 'Scientifically tuned to your Rashi, Kundli houses, and Mulank (Numerology root number 1 to 9).',
    },
    {
      icon: <Truck size={26} />,
      title: 'Pan-India Express Shipping',
      desc: 'Free doorstep express delivery across 19,000+ PIN codes with tamper-proof sacred packaging.',
    },
    {
      icon: <CheckCircle2 size={26} />,
      title: 'Razorpay & COD Supported',
      desc: 'Pay seamlessly with 100% secured UPI, Credit/Debit Cards, NetBanking via Razorpay.',
    },
    {
      icon: <Headphones size={26} />,
      title: 'Dedicated Astro Support',
      desc: 'Our astrology guidance team helps you choose the exact crystal bracelet suited to your dasha.',
    },
  ];

  return (
    <section id="why-us" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.subtitle}>Uncompromising Sacred Standards</span>
          <h2 className={styles.title}>Why Seekers Choose REHAS Merchandise</h2>
        </div>

        <div className={styles.grid}>
          {pillars.map((item, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.iconWrap}>{item.icon}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
