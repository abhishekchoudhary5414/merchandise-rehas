'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Phone, Mail, MapPin, Clock } from 'lucide-react';
import siteConfig from '@/data/site-config.json';
import styles from './ContactSection.module.css';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Astrology Bracelet Consultation',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: 'Astrology Bracelet Consultation', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="contact" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.infoCol}>
          <span className={styles.subtitle}>Direct Consultation</span>
          <h2 className={styles.title}>Speak with Our Vedic Guidance Team</h2>
          <p className={styles.desc}>
            Unsure which crystal bracelet resonates with your birth chart or Mulank? Send us your query or birth details for personalized recommendation.
          </p>

          <div className={styles.contactItems}>
            <div className={styles.item}>
              <div className={styles.iconWrap}><Mail size={18} /></div>
              <div>
                <strong>Email Address</strong>
                <p>{siteConfig.contact.email}</p>
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.iconWrap}><Phone size={18} /></div>
              <div>
                <strong>WhatsApp & Call</strong>
                <p>{siteConfig.contact.phone}</p>
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.iconWrap}><Clock size={18} /></div>
              <div>
                <strong>Consultation Hours</strong>
                <p>{siteConfig.contact.hours}</p>
              </div>
            </div>
            <div className={styles.item}>
              <div className={styles.iconWrap}><MapPin size={18} /></div>
              <div>
                <strong>Sacred Atelier</strong>
                <p>{siteConfig.contact.address.fullAddress}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formCol}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {status === 'success' && (
              <div className={styles.alertSuccess}>
                <CheckCircle size={18} />
                <span>Pranam! Your message has been received. Our astrologer will reply within 24 hours.</span>
              </div>
            )}
            {status === 'error' && (
              <div className={styles.alertError}>
                <AlertCircle size={18} />
                <span>Failed to send message. Please reach us directly on WhatsApp.</span>
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Roy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="ananya@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label>WhatsApp / Mobile (+91)</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="Astrology Bracelet Consultation">Astrology Bracelet Consultation</option>
                  <option value="Order Tracking & Shipping">Order Tracking & Shipping</option>
                  <option value="Custom Energization Request">Custom Energization Request</option>
                  <option value="Wholesale & Bulk Inquiries">Wholesale & Bulk Inquiries</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label>Your Message / Date of Birth Details *</label>
              <textarea
                rows={4}
                required
                placeholder="Mention your query, intention (wealth, protection, peace), or birth details..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button type="submit" disabled={status === 'loading'} className={styles.submitBtn}>
              {status === 'loading' ? 'Submitting...' : 'Send Sacred Message'} <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
