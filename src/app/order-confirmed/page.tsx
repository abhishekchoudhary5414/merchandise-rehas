'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight, Truck, ShieldCheck, Clock3, MapPin } from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import styles from './OrderConfirmed.module.css';

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || '';
  const isCod = searchParams.get('cod') === 'true';
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderNumber) return;
    fetch(`/api/orders/status?orderNumber=${encodeURIComponent(orderNumber)}`)
      .then((res) => res.json())
      .then((data) => { if (data.order) setOrder(data.order); })
      .catch(() => undefined);
  }, [orderNumber]);

  const status = order?.shippingStatus || 'PROCESSING';
  const trackingNumber = order?.trackingNumber || 'Available after dispatch';

  return (
    <div className={styles.page}>
      <AnnouncementBar /><Navbar />
      <main className={styles.main}>
        <div className={styles.confirmationGrid}>
          <section className={styles.heroCard}>
            <div className={styles.iconRing}><CheckCircle2 size={38} strokeWidth={2.2} /></div>
            <span className={styles.badge}><ShieldCheck size={13} /> {isCod || order?.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Payment confirmed'}</span>
            <h1>Thank you for your order!</h1>
            <p className={styles.intro}>Your sacred merchandise is now confirmed and will be carefully prepared for dispatch. We will keep you updated at every delivery milestone.</p>
            <div className={styles.orderMeta}>
              <div className={styles.metaItem}><span>Order number</span><strong>#{orderNumber}</strong></div>
              <div className={styles.metaItem}><span>Estimated delivery</span><strong>3–5 business days</strong></div>
            </div>
            <div className={styles.actions}>
              <Link
                href="/track-order"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('rehas_track_order_num', orderNumber);
                  }
                }}
                className={styles.primaryAction}
              >
                <Truck size={17} /> Track your order
              </Link>
              <Link href="/shop" className={styles.secondaryAction}>Continue shopping <ArrowRight size={16} /></Link>
            </div>
          </section>

          <aside className={styles.summaryCard}>
            <div className={styles.summaryTitle}><Truck size={20} /><h2>Delivery summary</h2></div>
            <div className={styles.statusBlock}><span className={styles.statusLabel}>Current status</span><div className={styles.statusValue}><span className={styles.statusDot} />{status.replaceAll('_', ' ')}</div></div>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}><span>Courier</span><strong>{order?.trackingCourier || 'REHAS Express'}</strong></div>
              <div className={styles.summaryRow}><span>Tracking ID</span><strong>{trackingNumber}</strong></div>
              <div className={styles.summaryRow}><span>Payment</span><strong>{order?.paymentStatus || (isCod ? 'COD' : 'Verified')}</strong></div>
            </div>
          </aside>

          <section className={styles.timelineCard}>
            <div className={styles.timelineTitle}><h2>Order journey</h2><span>We’ll notify you by email for every update</span></div>
            <div className={styles.timeline}>
              <div className={styles.step}><div className={styles.stepIcon}><CheckCircle2 size={15} /></div><strong>Confirmed</strong><span>Order received</span></div>
              <div className={styles.step}><div className={styles.stepIcon}><Package size={15} /></div><strong>Processing</strong><span>Preparing safely</span></div>
              <div className={styles.step}><div className={styles.stepIcon}><Truck size={15} /></div><strong>Shipped</strong><span>On the way</span></div>
              <div className={styles.step}><div className={styles.stepIcon}><MapPin size={15} /></div><strong>Delivered</strong><span>At your address</span></div>
            </div>
          </section>
        </div>
      </main>
      <Footer /><WhatsAppFloat />
    </div>
  );
}

export default function OrderConfirmedPage() {
  return <Suspense fallback={<div className={styles.page} style={{ minHeight: '100vh' }} />}><OrderConfirmedContent /></Suspense>;
}
