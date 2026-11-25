'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Pencil,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import styles from './AccountPage.module.css';

const emptyAddress = { 
  id: '', 
  fullName: '', 
  phone: '', 
  flatBuilding: '', 
  streetArea: '', 
  landmark: '', 
  city: '', 
  state: '', 
  pinCode: '', 
  isDefault: false 
};

type AccountData = {
  user: { 
    id: string; 
    name: string; 
    email: string; 
    phone?: string; 
    createdAt: string; 
    addresses: any[] 
  };
  orders: any[];
};

export default function AccountPage() {
  const router = useRouter();
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('overview');

  // Address Management State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState(emptyAddress);
  const [savingAddress, setSavingAddress] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Wishlist item count in state
  const [wishlistCount, setWishlistCount] = useState(0);

  async function loadAccount(isBackground = false) {
    if (!isBackground) {
      // 1. Instant Cache-First Hydration
      try {
        const cached = localStorage.getItem('rehas_account_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.user) {
            setData(parsed);
            setProfileName(parsed.user.name || '');
            setProfilePhone(parsed.user.phone || '');
            setLoading(false);
          }
        }
      } catch {
        // ignore cache read failure
      }
    }

    try {
      const res = await fetch('/api/account');
      if (res.status === 401) {
        localStorage.removeItem('rehas_account_cache');
        router.replace('/login?redirect=/account');
        return;
      }
      const result = await res.json();
      if (res.ok && result.user) {
        setData(result);
        setProfileName(result.user.name || '');
        setProfilePhone(result.user.phone || '');
        try {
          localStorage.setItem('rehas_account_cache', JSON.stringify(result));
        } catch {
          // ignore cache write failure
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    loadAccount(); 
    try {
      const saved = JSON.parse(localStorage.getItem('rehas_wishlist') || '[]');
      if (Array.isArray(saved)) setWishlistCount(saved.length);
    } catch {
      setWishlistCount(0);
    }
  }, []);

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setSavingAddress(true);
    setMessage('');
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessageType('error');
        setMessage(result.error || 'Could not save address');
      } else {
        setAddress(emptyAddress);
        setShowAddressForm(false);
        setMessageType('success');
        setMessage(address.id ? 'Delivery address updated successfully!' : 'New delivery address added successfully!');
        await loadAccount();
      }
    } catch {
      setMessageType('error');
      setMessage('Failed to save delivery address.');
    } finally {
      setSavingAddress(false);
    }
  }

  async function makeDefaultAddress(id: string) {
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      });
      if (res.ok) {
        setMessageType('success');
        setMessage('Primary delivery address updated.');
        await loadAccount();
      }
    } catch {
      // ignore
    }
  }

  async function deleteAddress(id: string) {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' });
      setMessageType('success');
      setMessage('Address removed.');
      await loadAccount();
    } catch {
      // ignore
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setMessage('');
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessageType('error');
        setMessage(result.error || 'Could not update profile');
      } else {
        setMessageType('success');
        setMessage('Personal profile updated successfully!');
        setIsEditingProfile(false);
        await loadAccount();
      }
    } catch {
      setMessageType('error');
      setMessage('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function logout() {
    try {
      localStorage.removeItem('rehas_account_cache');
    } catch { /* ignore */ }
    await fetch('/api/auth/me', { method: 'DELETE' });
    router.replace('/login');
  }

  const initials = data?.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RM';

  return (
    <div className={styles.pageWrap}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        {/* Common Reusable Breadcrumb & Back Navigation */}
        <BreadcrumbNav
          items={[
            { label: 'My Account', href: active !== 'overview' ? '/account' : undefined },
            ...(active !== 'overview'
              ? [
                  {
                    label:
                      active === 'addresses'
                        ? 'Saved Addresses'
                        : active === 'orders'
                        ? 'My Orders'
                        : 'Personal Information',
                  },
                ]
              : []),
          ]}
          showBackButton={true}
          backLabel="Back"
        />

        {/* Dynamic Feedback Notification */}
        {message && (
          <div 
            className={styles.message} 
            style={messageType === 'error' ? { background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C' } : {}}
          >
            {messageType === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message}</span>
          </div>
        )}

        {/* Top Luxury Patron Welcome Hero Banner */}
        {loading ? (
          <div className={styles.skeletonHero}>
            <div className={styles.skeletonHeroLeft}>
              <div className={`${styles.shimmerBase} ${styles.skeletonHeroAvatar}`} />
              <div className={styles.skeletonHeroLines}>
                <div className={`${styles.shimmerBase} ${styles.skeletonHeroBadge}`} />
                <div className={`${styles.shimmerBase} ${styles.skeletonHeroTitle}`} />
                <div className={`${styles.shimmerBase} ${styles.skeletonHeroMeta}`} />
              </div>
            </div>
            <div className={`${styles.shimmerBase} ${styles.skeletonHeroBtn}`} />
          </div>
        ) : data ? (
          <section className={styles.patronHero}>
            <div className={styles.patronHeroLeft}>
              <div className={styles.heroAvatar}>{initials}</div>
              <div className={styles.heroDetails}>
                <div className={styles.heroGreetingRow}>
                  <span className={styles.heroGreeting}>Vedic Boutique Portal</span>
                  <span className={styles.patronCrownBadge}>
                    <Sparkles size={11} /> Consecrated Patron
                  </span>
                </div>
                <h1 className={styles.heroName}>{data.user.name}</h1>
                <div className={styles.heroMeta}>
                  <div className={styles.heroMetaItem}>
                    <Mail size={14} />
                    <span>{data.user.email}</span>
                  </div>
                  {data.user.phone && (
                    <div className={styles.heroMetaItem}>
                      <Phone size={14} />
                      <span>+91 {data.user.phone}</span>
                    </div>
                  )}
                  <div className={styles.heroMetaItem}>
                    <Calendar size={14} />
                    <span>Member since {new Date(data.user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.heroActions}>
              <Link href="/shop" className={styles.heroShopBtn}>
                <ShoppingBag size={16} />
                <span>Explore Bracelets</span>
              </Link>
              <button type="button" onClick={logout} className={styles.heroLogoutBtn}>
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </section>
        ) : null}

        <div className={styles.layout}>
          {/* Left Sidebar Menu */}
          <aside className={styles.sidebar}>
            {loading ? (
              <div>
                <div className={styles.skeletonSidebarBlock}>
                  <div className={`${styles.shimmerBase} ${styles.skeletonSidebarAvatar}`} />
                  <div className={styles.skeletonSidebarLines}>
                    <div className={`${styles.shimmerBase} ${styles.skeletonSidebarLineSm}`} />
                    <div className={`${styles.shimmerBase} ${styles.skeletonSidebarLineLg}`} />
                    <div className={`${styles.shimmerBase} ${styles.skeletonSidebarBadge}`} />
                  </div>
                </div>
                <div className={styles.skeletonMenuItems}>
                  <div className={`${styles.shimmerBase} ${styles.skeletonMenuItem}`} />
                  <div className={`${styles.shimmerBase} ${styles.skeletonMenuItem}`} />
                  <div className={`${styles.shimmerBase} ${styles.skeletonMenuItem}`} />
                  <div className={`${styles.shimmerBase} ${styles.skeletonMenuItem}`} />
                </div>
              </div>
            ) : (
              <nav className={styles.menu}>
                <button 
                  className={`${styles.menuItem} ${active === 'overview' ? styles.menuActive : ''}`} 
                  onClick={() => { setActive('overview'); setShowAddressForm(false); setIsEditingProfile(false); setMessage(''); }}
                >
                  <User size={18} /> Account Overview
                </button>
                <button 
                  className={`${styles.menuItem} ${active === 'orders' ? styles.menuActive : ''}`} 
                  onClick={() => { setActive('orders'); setShowAddressForm(false); setIsEditingProfile(false); setMessage(''); }}
                >
                  <Package size={18} /> My Sacred Orders <span>{data?.orders.length || 0}</span>
                </button>
                <button 
                  className={`${styles.menuItem} ${active === 'addresses' ? styles.menuActive : ''}`} 
                  onClick={() => { setActive('addresses'); setShowAddressForm(false); setIsEditingProfile(false); setMessage(''); }}
                >
                  <MapPin size={18} /> Delivery Addresses <span>{data?.user.addresses.length || 0}</span>
                </button>
                <Link href="/wishlist" className={styles.menuItem}>
                  <Heart size={18} /> My Wishlist <span>{wishlistCount}</span>
                </Link>

                <div className={styles.sidebarDivider} />

                <div className={styles.sidebarTrustBox}>
                  <span className={styles.sidebarTrustTitle}>
                    <ShieldCheck size={14} /> Sacred Consecration
                  </span>
                  <p className={styles.sidebarTrustDesc}>
                    Every item ordered under your patron account is energized through sacred Vedic rituals for divine alignment.
                  </p>
                </div>
              </nav>
            )}
          </aside>

          {/* Main Content Showcase */}
          <section className={styles.content}>
            {loading ? (
              <div className={styles.skeletonWrap}>
                {/* Header Bar Skeleton */}
                <div className={styles.skeletonHeaderBar}>
                  <div className={styles.skeletonHeaderTitleGroup}>
                    <div className={`${styles.shimmerBase} ${styles.skeletonHeaderTag}`} />
                    <div className={`${styles.shimmerBase} ${styles.skeletonHeaderHeading}`} />
                  </div>
                  <div className={`${styles.shimmerBase} ${styles.skeletonHeaderRight}`} />
                </div>

                {/* 3 Metrics Cards Skeleton */}
                <div className={styles.skeletonCardsGrid}>
                  <div className={styles.skeletonMetricCard}>
                    <div className={`${styles.shimmerBase} ${styles.skeletonMetricIcon}`} />
                    <div className={styles.skeletonMetricLines}>
                      <div className={`${styles.shimmerBase} ${styles.skeletonMetricVal}`} />
                      <div className={`${styles.shimmerBase} ${styles.skeletonMetricSub}`} />
                    </div>
                  </div>
                  <div className={styles.skeletonMetricCard}>
                    <div className={`${styles.shimmerBase} ${styles.skeletonMetricIcon}`} />
                    <div className={styles.skeletonMetricLines}>
                      <div className={`${styles.shimmerBase} ${styles.skeletonMetricVal}`} />
                      <div className={`${styles.shimmerBase} ${styles.skeletonMetricSub}`} />
                    </div>
                  </div>
                  <div className={styles.skeletonMetricCard}>
                    <div className={`${styles.shimmerBase} ${styles.skeletonMetricIcon}`} style={{ background: '#FFF1F2' }} />
                    <div className={styles.skeletonMetricLines}>
                      <div className={`${styles.shimmerBase} ${styles.skeletonMetricVal}`} />
                      <div className={`${styles.shimmerBase} ${styles.skeletonMetricSub}`} />
                    </div>
                  </div>
                </div>

                {/* Personal Information Card Skeleton */}
                <div className={styles.skeletonSectionCard}>
                  <div className={styles.skeletonSectionCardTop}>
                    <div className={`${styles.shimmerBase} ${styles.skeletonSectionCardTitle}`} />
                    <div className={`${styles.shimmerBase} ${styles.skeletonSectionCardAction}`} />
                  </div>
                  <div className={styles.skeletonSectionBody}>
                    <div className={styles.skeletonInfoCell}>
                      <div className={`${styles.shimmerBase} ${styles.skeletonInfoCellIcon}`} />
                      <div className={styles.skeletonInfoCellLines}>
                        <div className={`${styles.shimmerBase} ${styles.skeletonInfoCellLabel}`} />
                        <div className={`${styles.shimmerBase} ${styles.skeletonInfoCellValue}`} />
                      </div>
                    </div>
                    <div className={styles.skeletonInfoCell}>
                      <div className={`${styles.shimmerBase} ${styles.skeletonInfoCellIcon}`} />
                      <div className={styles.skeletonInfoCellLines}>
                        <div className={`${styles.shimmerBase} ${styles.skeletonInfoCellLabel}`} />
                        <div className={`${styles.shimmerBase} ${styles.skeletonInfoCellValue}`} />
                      </div>
                    </div>
                    <div className={styles.skeletonInfoCell}>
                      <div className={`${styles.shimmerBase} ${styles.skeletonInfoCellIcon}`} />
                      <div className={styles.skeletonInfoCellLines}>
                        <div className={`${styles.shimmerBase} ${styles.skeletonInfoCellLabel}`} />
                        <div className={`${styles.shimmerBase} ${styles.skeletonInfoCellValue}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Address Preview Skeleton */}
                <div className={styles.skeletonSectionCard}>
                  <div className={styles.skeletonSectionCardTop}>
                    <div className={`${styles.shimmerBase} ${styles.skeletonSectionCardTitle}`} />
                    <div className={`${styles.shimmerBase} ${styles.skeletonSectionCardAction}`} />
                  </div>
                  <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className={`${styles.shimmerBase}`} style={{ width: '220px', height: '20px' }} />
                    <div className={`${styles.shimmerBase}`} style={{ width: '65%', height: '16px' }} />
                    <div className={`${styles.shimmerBase}`} style={{ width: '180px', height: '16px' }} />
                  </div>
                </div>
              </div>
            ) : data ? (
              <>
                {/* 1. OVERVIEW TAB */}
                {active === 'overview' && (
                  <>
                    <div className={styles.contentHeader}>
                      <div>
                        <p>
                          <Sparkles size={13} /> Patron Overview & Fast Actions
                        </p>
                        <h1>Namaste, {data.user.name.split(' ')[0]}</h1>
                      </div>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <CheckCircle2 size={15} color="#047857" /> Verified REHAS Account
                      </span>
                    </div>

                    {/* Three Metric Cards with Perfectly Centered Icons */}
                    <div className={styles.summaryGrid}>
                      <div className={styles.summaryCard} onClick={() => setActive('orders')}>
                        <div className={styles.summaryCardIcon}>
                          <Package size={26} />
                        </div>
                        <div className={styles.summaryCardContent}>
                          <strong>{data.orders.length} Sacred Orders</strong>
                          <span>Track real-time shipment</span>
                        </div>
                        <ChevronRight size={20} className={styles.summaryCardArrow} />
                      </div>

                      <div className={styles.summaryCard} onClick={() => setActive('addresses')}>
                        <div className={styles.summaryCardIcon}>
                          <MapPin size={26} />
                        </div>
                        <div className={styles.summaryCardContent}>
                          <strong>{data.user.addresses.length} Saved Addresses</strong>
                          <span>Manage delivery destinations</span>
                        </div>
                        <ChevronRight size={20} className={styles.summaryCardArrow} />
                      </div>

                      <Link href="/wishlist" className={styles.summaryCard}>
                        <div className={styles.summaryCardIcon} style={{ background: '#FFF1F2', color: '#E11D48', borderColor: '#FECDD3' }}>
                          <Heart size={26} />
                        </div>
                        <div className={styles.summaryCardContent}>
                          <strong>{wishlistCount} Saved Bracelets</strong>
                          <span>In your sacred wishlist</span>
                        </div>
                        <ChevronRight size={20} className={styles.summaryCardArrow} />
                      </Link>
                    </div>

                    {/* Personal Information Card */}
                    <div className={styles.detailsCard}>
                      <div className={styles.cardTitle}>
                        <h2>
                          <User size={18} /> Personal Details
                        </h2>
                        <button type="button" onClick={() => setIsEditingProfile((prev) => !prev)}>
                          <Pencil size={14} /> {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                        </button>
                      </div>

                      {isEditingProfile ? (
                        <form onSubmit={handleUpdateProfile} className={styles.profileEditForm}>
                          <div className={styles.profileInputGroup}>
                            <label>Full Name *</label>
                            <input 
                              type="text" 
                              required 
                              value={profileName} 
                              onChange={(e) => setProfileName(e.target.value)} 
                              className={styles.profileInput} 
                            />
                          </div>

                          <div className={styles.profileInputGroup}>
                            <label>10-Digit Mobile Number (Optional)</label>
                            <input 
                              type="tel" 
                              maxLength={10} 
                              placeholder="e.g. 9876543210" 
                              value={profilePhone} 
                              onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ''))} 
                              className={styles.profileInput} 
                            />
                          </div>

                          <div className={styles.profileActions}>
                            <button 
                              type="button" 
                              className={styles.cancel} 
                              onClick={() => setIsEditingProfile(false)}
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit" 
                              disabled={savingProfile} 
                              className={styles.save}
                            >
                              {savingProfile ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <div className={styles.infoItemIcon}>
                              <User size={18} />
                            </div>
                            <div className={styles.infoItemText}>
                              <span>Full Name</span>
                              <strong>{data.user.name}</strong>
                            </div>
                          </div>

                          <div className={styles.infoItem}>
                            <div className={styles.infoItemIcon}>
                              <Mail size={18} />
                            </div>
                            <div className={styles.infoItemText}>
                              <span>Email Address</span>
                              <strong>{data.user.email}</strong>
                            </div>
                          </div>

                          <div className={styles.infoItem}>
                            <div className={styles.infoItemIcon}>
                              <Phone size={18} />
                            </div>
                            <div className={styles.infoItemText}>
                              <span>Mobile Number</span>
                              <strong>{data.user.phone ? `+91 ${data.user.phone}` : 'Not provided yet'}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Primary Delivery Address Preview Card */}
                    <div className={styles.detailsCard}>
                      <div className={styles.cardTitle}>
                        <h2>
                          <MapPin size={18} /> Primary Delivery Address
                        </h2>
                        <button type="button" onClick={() => setActive('addresses')}>
                          <MapPin size={14} /> Change / Manage Addresses
                        </button>
                      </div>

                      {data.user.addresses.length > 0 ? (
                        (() => {
                          const primary = data.user.addresses.find((a: any) => a.isDefault) || data.user.addresses[0];
                          return (
                            <div className={styles.primaryAddressBox}>
                              <div className={styles.addressDetailsCol}>
                                <div className={styles.addressNameRow}>
                                  <span className={styles.addressName}>{primary.fullName}</span>
                                  <span className={styles.defaultBadge} style={{ position: 'static' }}>
                                    <CheckCircle2 size={12} /> Default Destination
                                  </span>
                                </div>
                                <p className={styles.addressLine}>
                                  {primary.flatBuilding}, {primary.streetArea}{primary.landmark ? `, Near ${primary.landmark}` : ''}<br />
                                  {primary.city}, {primary.state} — <strong>{primary.pinCode}</strong>
                                </p>
                                <span className={styles.addressPhoneRow}>
                                  <Phone size={14} /> Mobile: +91 {primary.phone}
                                </span>
                              </div>
                              <button 
                                type="button" 
                                className={styles.cancel}
                                onClick={() => setActive('addresses')}
                              >
                                Manage All Addresses
                              </button>
                            </div>
                          );
                        })()
                      ) : (
                        <div style={{ padding: '28px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          <p style={{ margin: '0 0 14px', fontSize: '14px' }}>No saved delivery address yet.</p>
                          <button 
                            type="button" 
                            className={styles.addButton}
                            onClick={() => { setActive('addresses'); setShowAddressForm(true); }}
                            style={{ margin: '0 auto' }}
                          >
                            <Plus size={16} /> Add Delivery Address
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* 2. ORDERS TAB */}
                {active === 'orders' && (
                  <>
                    <div className={styles.contentHeader}>
                      <div>
                        <p>
                          <Package size={13} /> Order History & Courier Dispatch
                        </p>
                        <h1>My Sacred Orders ({data.orders.length})</h1>
                      </div>
                      <Link href="/shop" className={styles.addButton}>
                        <Sparkles size={16} /> Explore Bracelets
                      </Link>
                    </div>

                    {data.orders.length === 0 ? (
                      <div className={styles.empty}>
                        <Package size={56} color="var(--primary)" style={{ opacity: 0.5 }} />
                        <h2>No orders placed yet</h2>
                        <p>When you purchase consecrated merchandise, your tracking updates and receipt history will appear right here.</p>
                        <Link href="/shop">Browse Sacred Collection</Link>
                      </div>
                    ) : (
                      <div className={styles.orderList}>
                        {data.orders.map((order: any) => (
                          <article className={styles.orderCard} key={order.id}>
                            <div className={styles.orderTop}>
                              <div>
                                <span>ORDER PLACED</span>
                                <strong>
                                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </strong>
                              </div>
                              <div>
                                <span>ORDER NUMBER</span>
                                <strong>{order.orderNumber}</strong>
                              </div>
                              <div>
                                <span>TOTAL AMOUNT</span>
                                <strong style={{ color: 'var(--primary)' }}>
                                  ₹{Math.round(order.totalAmount).toLocaleString('en-IN')}
                                </strong>
                              </div>
                              <span
                                className={styles.status}
                                style={{
                                  background:
                                    order.shippingStatus === 'DELIVERED'
                                      ? '#ECFDF5'
                                      : order.shippingStatus === 'CANCELLED'
                                      ? '#FEF2F2'
                                      : order.shippingStatus === 'DISPATCHED' || order.shippingStatus === 'SHIPPED'
                                      ? '#EFF6FF'
                                      : '#FAF5FC',
                                  color:
                                    order.shippingStatus === 'DELIVERED'
                                      ? '#059669'
                                      : order.shippingStatus === 'CANCELLED'
                                      ? '#DC2626'
                                      : order.shippingStatus === 'DISPATCHED' || order.shippingStatus === 'SHIPPED'
                                      ? '#2563EB'
                                      : 'var(--primary)',
                                  borderColor:
                                    order.shippingStatus === 'DELIVERED'
                                      ? '#A7F3D0'
                                      : order.shippingStatus === 'CANCELLED'
                                      ? '#FECACA'
                                      : order.shippingStatus === 'DISPATCHED' || order.shippingStatus === 'SHIPPED'
                                      ? '#BFDBFE'
                                      : 'rgba(86,0,103,0.15)',
                                }}
                              >
                                <CheckCircle2 size={13} /> {order.shippingStatus}
                              </span>
                            </div>

                            {order.items.map((item: any) => (
                              <div className={styles.orderItem} key={item.id}>
                                <div className={styles.productThumb}>
                                  <img 
                                    src={item.product?.primaryImage || '/images/rehas-logo.png'} 
                                    alt={item.product?.name || 'Bracelet'} 
                                  />
                                </div>
                                <div>
                                  <Link href={`/product/${item.product?.slug || ''}`}>
                                    {item.product?.name || 'REHAS Consecrated Merchandise'}
                                  </Link>
                                  <span>Quantity: {item.quantity}</span>
                                </div>
                                <Link 
                                  className={styles.track} 
                                  href={`/track-order?orderNumber=${order.orderNumber}`}
                                >
                                  <span>Track Order</span>
                                  <ArrowRight size={14} />
                                </Link>
                              </div>
                            ))}
                          </article>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* 3. ADDRESSES TAB */}
                {active === 'addresses' && (
                  <>
                    <div className={styles.contentHeader}>
                      <div>
                        <p>
                          <MapPin size={13} /> Pan-India Doorstep Destinations
                        </p>
                        <h1>Saved Delivery Addresses ({data.user.addresses.length})</h1>
                      </div>
                      {!showAddressForm && (
                        <button 
                          className={styles.addButton} 
                          onClick={() => { setAddress(emptyAddress); setShowAddressForm(true); }}
                        >
                          <Plus size={17} /> Add New Address
                        </button>
                      )}
                    </div>

                    {showAddressForm && (
                      <form className={styles.addressForm} onSubmit={saveAddress}>
                        <h2>{address.id ? 'Edit Delivery Address' : 'Add New Delivery Address'}</h2>
                        <div className={styles.formGrid}>
                          <label>
                            <span>Full Name *</span>
                            <input
                              value={address.fullName}
                              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                              required
                              placeholder="e.g. Priya Sharma"
                            />
                          </label>

                          <label>
                            <span>10-Digit Mobile Number *</span>
                            <input
                              value={address.phone}
                              onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, '') })}
                              required
                              maxLength={10}
                              inputMode="numeric"
                              placeholder="e.g. 9876543210"
                            />
                          </label>

                          <label className={styles.full}>
                            <span>Flat, House No., Building, Apartment *</span>
                            <input
                              value={address.flatBuilding}
                              onChange={(e) => setAddress({ ...address, flatBuilding: e.target.value })}
                              required
                              placeholder="e.g. Flat 402, Lotus Residency"
                            />
                          </label>

                          <label className={styles.full}>
                            <span>Area, Street, Sector, Village *</span>
                            <input
                              value={address.streetArea}
                              onChange={(e) => setAddress({ ...address, streetArea: e.target.value })}
                              required
                              placeholder="e.g. MG Road, Near City Mall"
                            />
                          </label>

                          <label>
                            <span>Landmark (Optional)</span>
                            <input
                              value={address.landmark}
                              onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                              placeholder="e.g. Near Shiva Temple"
                            />
                          </label>

                          <label>
                            <span>City *</span>
                            <input
                              value={address.city}
                              onChange={(e) => setAddress({ ...address, city: e.target.value })}
                              required
                              placeholder="e.g. Mumbai"
                            />
                          </label>

                          <label>
                            <span>State *</span>
                            <input
                              value={address.state}
                              onChange={(e) => setAddress({ ...address, state: e.target.value })}
                              required
                              placeholder="e.g. Maharashtra"
                            />
                          </label>

                          <label>
                            <span>6-Digit PIN Code *</span>
                            <input
                              value={address.pinCode}
                              onChange={(e) => setAddress({ ...address, pinCode: e.target.value.replace(/\D/g, '') })}
                              required
                              maxLength={6}
                              inputMode="numeric"
                              placeholder="e.g. 400001"
                            />
                          </label>
                        </div>

                        <label className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={address.isDefault}
                            onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })}
                          />
                          <span>Set as my primary default delivery address</span>
                        </label>

                        <div className={styles.formActions}>
                          <button 
                            type="button" 
                            className={styles.cancel} 
                            onClick={() => setShowAddressForm(false)}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className={styles.save} 
                            disabled={savingAddress}
                          >
                            {savingAddress ? 'Saving...' : 'Save Address'}
                          </button>
                        </div>
                      </form>
                    )}

                    <div className={styles.addressGrid}>
                      {data.user.addresses.map((item: any) => (
                        <article 
                          className={`${styles.addressCard} ${item.isDefault ? styles.addressCardDefault : ''}`} 
                          key={item.id}
                        >
                          {item.isDefault && (
                            <span className={styles.defaultBadge}>
                              <CheckCircle2 size={12} /> Default
                            </span>
                          )}
                          <h3>{item.fullName}</h3>
                          <p>
                            {item.flatBuilding}, {item.streetArea}
                            {item.landmark ? `, Near ${item.landmark}` : ''}
                            <br />
                            {item.city}, {item.state} — <strong>{item.pinCode}</strong>
                          </p>
                          <strong>Mobile: +91 {item.phone}</strong>

                          <div className={styles.addressActions}>
                            {!item.isDefault && (
                              <button 
                                type="button" 
                                className={styles.setDefaultBtn}
                                onClick={() => makeDefaultAddress(item.id)}
                              >
                                <CheckCircle2 size={14} /> Set Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setAddress({
                                  id: item.id,
                                  fullName: item.fullName,
                                  phone: item.phone,
                                  flatBuilding: item.flatBuilding,
                                  streetArea: item.streetArea,
                                  landmark: item.landmark || '',
                                  city: item.city,
                                  state: item.state,
                                  pinCode: item.pinCode,
                                  isDefault: item.isDefault,
                                });
                                setShowAddressForm(true);
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button 
                              type="button" 
                              className={styles.removeBtn} 
                              onClick={() => deleteAddress(item.id)}
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>

                    {data.user.addresses.length === 0 && !showAddressForm && (
                      <div className={styles.empty}>
                        <MapPin size={56} color="var(--primary)" style={{ opacity: 0.5 }} />
                        <h2>No saved delivery addresses</h2>
                        <p>Save your home or work address for seamless, 1-click checkout on all sacred merchandise.</p>
                        <button type="button" onClick={() => setShowAddressForm(true)}>
                          Add Delivery Address
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                <h2>Could not load your account</h2>
                <p>Please log in again to access your account dashboard.</p>
                <Link href="/login">Sign In</Link>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
