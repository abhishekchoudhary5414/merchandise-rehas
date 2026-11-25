'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Truck,
  CheckCircle2,
  Package,
  MapPin,
  ShieldCheck,
  Clock3,
  XCircle,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import styles from './TrackOrder.module.css';

const timeline = [
  { status: 'PROCESSING', title: 'Confirmed & Energizing', description: 'Vedic ritual consecration initiated', icon: CheckCircle2 },
  { status: 'PACKED', title: 'Safely Packed', description: 'Sealed in velvet pouch with certificate', icon: Package },
  { status: 'SHIPPED', title: 'Dispatched & In Transit', description: 'Courier received & on the way', icon: Truck },
  { status: 'DELIVERED', title: 'Delivered', description: 'Arrived at your doorstep', icon: MapPin },
];

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('orderNumber') || '';
  const [orderQuery, setOrderQuery] = useState(initialOrder);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadOrder(orderNumber: string) {
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/status?orderNumber=${encodeURIComponent(orderNumber.trim())}`);
      const data = await res.json();
      if (res.status === 401) {
        router.replace('/login');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Unable to locate this order number');
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Unable to find this order');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Check either query param or sessionStorage
    let targetOrder = initialOrder;
    if (!targetOrder && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('rehas_track_order_num');
      if (stored) {
        targetOrder = stored;
        sessionStorage.removeItem('rehas_track_order_num');
      }
    }

    if (targetOrder) {
      setOrderQuery(targetOrder);
      loadOrder(targetOrder);
      // Clean up url in address bar to stay cleanly at /track-order without query params
      if (typeof window !== 'undefined' && window.location.search) {
        window.history.replaceState({}, '', '/track-order');
      }
    }
  }, [initialOrder]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    loadOrder(orderQuery.trim());
  }

  const trackingStatus = (order?.shippingStatus || '').toUpperCase();
  const paymentStatus = (order?.paymentStatus || '').toUpperCase();

  const isRefunded = trackingStatus === 'REFUNDED' || paymentStatus === 'REFUNDED';
  const isCancelled = trackingStatus === 'CANCELLED' || paymentStatus === 'CANCELLED';

  const statusIndex =
    trackingStatus === 'PACKED'
      ? 1
      : trackingStatus === 'SHIPPED' || trackingStatus === 'OUT_FOR_DELIVERY' || trackingStatus === 'DISPATCHED'
      ? 2
      : trackingStatus === 'DELIVERED'
      ? 3
      : 0;

  return (
    <div className={styles.page}>
      <AnnouncementBar />
      <Navbar />
      <main className={styles.main}>
        <BreadcrumbNav
          items={[{ label: 'Track Order' }]}
          showBackButton={true}
          backLabel="Back"
        />

        <div className={styles.heading}>
          <div className={styles.headingText}>
            <p>
              <Sparkles size={13} color="#D8B878" />
              <span>Sacred Express Tracking</span>
            </p>
            <h1>Track Your Sacred Order</h1>
          </div>
          <Link href="/account" className={styles.back}>
            <ArrowLeft size={15} />
            <span>My Account & Orders</span>
          </Link>
        </div>

        {/* 100% Full-Width Search Card */}
        <form className={styles.searchCard} onSubmit={handleSearch}>
          <label htmlFor="tracking-order">Search by Sacred Order Number</label>
          <div className={styles.searchRow}>
            <input
              id="tracking-order"
              className={styles.searchInput}
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="e.g. REHAS-IN-333997-592"
            />
            <button
              className={styles.searchButton}
              type="submit"
              disabled={loading || !orderQuery.trim()}
            >
              <Search size={16} /> Track Order
            </button>
          </div>
        </form>

        {loading ? (
          <div className={styles.empty}>
            <Clock3 size={44} className="animate-spin" />
            <h2>Looking up your sacred order...</h2>
            <p>Retrieving real-time transit & consecration status from the database.</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <ShieldCheck size={44} color="#DC2626" />
            <h2>Order Not Found</h2>
            <p>{error}</p>
            <button className={styles.retry} onClick={() => setOrderQuery(initialOrder)}>
              Try Again
            </button>
          </div>
        ) : order ? (
          <div className={styles.contentGrid}>
            {/* Left Column: Journey Timeline & Status Banner */}
            <section className={styles.timelineCard}>
              <div className={styles.cardHeader}>
                <h2>Order Journey & Consecration</h2>
                {isRefunded ? (
                  <span className={`${styles.statusBadge} ${styles.badgeYellow}`}>
                    <RotateCcw size={12} /> Refunded
                  </span>
                ) : isCancelled ? (
                  <span className={`${styles.statusBadge} ${styles.badgeRed}`}>
                    <XCircle size={12} /> Cancelled
                  </span>
                ) : trackingStatus === 'DELIVERED' ? (
                  <span className={`${styles.statusBadge} ${styles.badgeGreen}`}>
                    <CheckCircle2 size={12} /> Delivered
                  </span>
                ) : (
                  <span className={`${styles.statusBadge} ${styles.badgeDefault}`}>
                    <Truck size={12} /> {order.shippingStatus?.replaceAll('_', ' ')}
                  </span>
                )}
              </div>

              {/* Status Specific Highlights */}
              {isRefunded && (
                <div className={`${styles.statusAlertBanner} ${styles.bannerYellow}`}>
                  <div className={`${styles.alertIconWrap} ${styles.iconYellow}`}>
                    <RotateCcw size={22} />
                  </div>
                  <div className={styles.alertText}>
                    <h3>Payment Refunded</h3>
                    <p>
                      This order has been processed for a return and refund. The full amount is credited back to your original payment method. Depending on your bank, it reflects within 3–5 business days.
                    </p>
                  </div>
                </div>
              )}

              {isCancelled && !isRefunded && (
                <div className={`${styles.statusAlertBanner} ${styles.bannerRed}`}>
                  <div className={`${styles.alertIconWrap} ${styles.iconRed}`}>
                    <XCircle size={22} />
                  </div>
                  <div className={styles.alertText}>
                    <h3>Order Cancelled</h3>
                    <p>
                      This order was cancelled prior to shipment. Any temporary authorization or pending payments have been released. If you wish to re-order, please visit our sacred collection.
                    </p>
                  </div>
                </div>
              )}

              {/* Step Timeline (Visible for active, delivered, or reference) */}
              <div className={styles.timeline} style={isCancelled || isRefunded ? { opacity: 0.65 } : {}}>
                {timeline.map((step, index) => {
                  const Icon = step.icon;
                  const stepIndex = index;
                  const complete = isCancelled || isRefunded ? index === 0 : statusIndex < 0 ? index === 0 : stepIndex <= statusIndex;
                  const active = isCancelled || isRefunded ? false : statusIndex < 0 ? index === 0 : stepIndex === statusIndex;
                  return (
                    <div
                      className={`${styles.step} ${complete ? styles.complete : ''} ${active ? styles.active : ''}`}
                      key={step.status}
                    >
                      <div className={styles.stepIcon}>
                        <Icon size={16} />
                      </div>
                      <strong>{step.title}</strong>
                      <span>{step.description}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Right Column: Shipment Details */}
            <aside className={styles.summaryCard}>
              <h2>Shipment Details</h2>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Order Number</span>
                  <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>#{order.orderNumber}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Courier Partner</span>
                  <strong>{order.trackingCourier || 'Shiprocket Express'}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Tracking AWB</span>
                  <strong>{order.trackingNumber || 'Generated upon dispatch'}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Payment Status</span>
                  <strong
                    style={{
                      color:
                        isRefunded
                          ? '#D97706'
                          : isCancelled
                          ? '#DC2626'
                          : order.paymentStatus === 'PAID'
                          ? '#059669'
                          : 'var(--primary)',
                    }}
                  >
                    {order.paymentStatus}
                  </strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Order Date</span>
                  <strong>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>
                </div>
              </div>
            </aside>

            {/* Bottom 100% Full-Width Action Card */}
            <div className={styles.productCard}>
              <div>
                <Link href="/account">
                  <span>View All Your Orders in Patron Account</span>
                  <ArrowRight size={15} />
                </Link>
                <p>Tracking notifications and Vedic consecration updates are sent to your registered email.</p>
              </div>
              <div className={styles.support}>
                <ShieldCheck size={16} color="var(--primary)" />
                <span>Prana-Pratishtha Vedic Verified</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <Package size={44} />
            <h2>Enter your order number to track</h2>
            <p>You can find your REHAS order number in your order confirmation email or under your patron account.</p>
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className={styles.page} />}>
      <TrackOrderContent />
    </Suspense>
  );
}
