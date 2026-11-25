'use client';

import React from 'react';

interface WhatsAppFooterLinkProps {
  phone: string;
  className?: string;
  children: React.ReactNode;
}

export default function WhatsAppFooterLink({ phone, className, children }: WhatsAppFooterLinkProps) {
  function handleClick() {
    try {
      fetch('/api/whatsapp/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'footer_link',
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        }),
      }).catch(() => {});
    } catch {}
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}?text=Pranam%20REHAS%20Team!%20I%20would%20like%20guidance%20on%20choosing%20the%20right%20energized%20astrology%20crystal%20bracelet.`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{ color: '#4ADE80', fontWeight: 700 }}
      className={className}
    >
      {children}
    </a>
  );
}
