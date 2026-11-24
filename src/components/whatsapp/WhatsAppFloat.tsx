'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import siteConfig from '@/data/site-config.json';
import styles from './WhatsAppFloat.module.css';

interface WhatsAppFloatProps {
  phoneNumber?: string;
  prefilledMessage?: string;
}

export default function WhatsAppFloat({
  phoneNumber = siteConfig.contact.whatsappNumber,
  prefilledMessage = 'Pranam REHAS Team! I would like guidance on choosing the right energized astrology crystal bracelet.',
}: WhatsAppFloatProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(prefilledMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.floatBtn}
      aria-label={`Chat with ${siteConfig.brand.name} Astrologer on WhatsApp`}
    >
      <div className={styles.iconCircle}>
        <MessageCircle size={28} />
      </div>
      <span className={styles.label}>Astro WhatsApp</span>
    </a>
  );
}
