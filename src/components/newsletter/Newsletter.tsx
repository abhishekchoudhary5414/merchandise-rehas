'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, Mail } from 'lucide-react';
import styles from './Newsletter.module.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconCircle}>
            <Mail size={28} />
          </div>

          <h2 className={styles.title}>Receive Astro Transits & Sacred Alerts</h2>
          
          <p className={styles.desc}>
            Subscribe for free Vedic planetary transit warnings, full moon crystal rituals, and exclusive member-only energized bracelet launches.
          </p>

          {submitted ? (
            <div className={styles.success}>
              <CheckCircle size={20} />
              <span>Har Har Mahadev! You have been subscribed to REHAS Celestial Wisdom.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="email"
                required
                placeholder="Enter your sacred email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={styles.btn}>
                Subscribe <Send size={15} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
