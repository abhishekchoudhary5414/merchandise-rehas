'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, MapPin, Heart, LogOut, Plus, Trash2, ChevronRight, Pencil } from 'lucide-react';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import styles from './AccountPage.module.css';

const emptyAddress = { id: '', fullName: '', phone: '', flatBuilding: '', streetArea: '', landmark: '', city: '', state: '', pinCode: '', isDefault: false };

type AccountData = {
  user: { id: string; name: string; email: string; phone?: string; createdAt: string; addresses: any[] };
  orders: any[];
};

export default function AccountPage() {
  const router = useRouter();
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('overview');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadAccount() {
    setLoading(true);
    const res = await fetch('/api/account');
    if (res.status === 401) {
      router.replace('/login?redirect=/account');
      return;
    }
    const result = await res.json();
    if (res.ok) setData(result);
    setLoading(false);
  }

  useEffect(() => { loadAccount(); }, []);

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/account/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    });
    const result = await res.json();
    if (!res.ok) setMessage(result.error || 'Could not save address');
    else {
      setAddress(emptyAddress);
      setShowAddressForm(false);
      setMessage('Address saved successfully');
      await loadAccount();
    }
    setSaving(false);
  }

  async function deleteAddress(id: string) {
    if (!confirm('Remove this address?')) return;
    await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' });
    await loadAccount();
  }

  async function logout() {
    await fetch('/api/auth/me', { method: 'DELETE' });
    router.replace('/login');
  }

  const initials = data?.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '';

  return (
    <div className={styles.pageWrap}>
      <AnnouncementBar />
      <Navbar />
      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>Loading your account…</div>
        ) : data ? (
          <>
            <div className={styles.breadcrumb}>Account <ChevronRight size={14} /> <span>{active === 'addresses' ? 'Saved Addresses' : active === 'orders' ? 'My Orders' : 'Overview'}</span></div>
            <div className={styles.layout}>
              <aside className={styles.sidebar}>
                <div className={styles.profileBlock}>
                  <div className={styles.avatar}>{initials}</div>
                  <div><span>Hello,</span><strong>{data.user.name}</strong></div>
                </div>
                <nav className={styles.menu}>
                  <button className={active === 'overview' ? styles.menuActive : ''} onClick={() => setActive('overview')}><User size={18} /> Account Overview</button>
                  <button className={active === 'orders' ? styles.menuActive : ''} onClick={() => setActive('orders')}><Package size={18} /> My Orders <span>{data.orders.length}</span></button>
                  <button className={active === 'addresses' ? styles.menuActive : ''} onClick={() => setActive('addresses')}><MapPin size={18} /> Saved Addresses <span>{data.user.addresses.length}</span></button>
                  <Link href="/wishlist"><Heart size={18} /> My Wishlist</Link>
                  <button className={styles.logout} onClick={logout}><LogOut size={18} /> Logout</button>
                </nav>
              </aside>

              <section className={styles.content}>
                {active === 'overview' && (
                  <>
                    <div className={styles.contentHeader}><div><p>Account overview</p><h1>Welcome back, {data.user.name.split(' ')[0]}</h1></div></div>
                    <div className={styles.summaryGrid}>
                      <button className={styles.summaryCard} onClick={() => setActive('orders')}><Package size={22} /><div><strong>{data.orders.length}</strong><span>Orders placed</span></div><ChevronRight size={18} /></button>
                      <button className={styles.summaryCard} onClick={() => setActive('addresses')}><MapPin size={22} /><div><strong>{data.user.addresses.length}</strong><span>Saved addresses</span></div><ChevronRight size={18} /></button>
                      <Link className={styles.summaryCard} href="/wishlist"><Heart size={22} /><div><strong>Wishlist</strong><span>Saved products</span></div><ChevronRight size={18} /></Link>
                    </div>
                    <div className={styles.detailsCard}>
                      <div className={styles.cardTitle}><h2>Personal information</h2><button onClick={() => setActive('profile')}><Pencil size={14} /> Edit</button></div>
                      <div className={styles.infoGrid}><div><span>Full name</span><strong>{data.user.name}</strong></div><div><span>Email address</span><strong>{data.user.email}</strong></div><div><span>Mobile number</span><strong>{data.user.phone || 'Not added'}</strong></div></div>
                    </div>
                  </>
                )}

                {active === 'orders' && (
                  <>
                    <div className={styles.contentHeader}><div><p>Purchase history</p><h1>My Orders</h1></div></div>
                    {data.orders.length === 0 ? <div className={styles.empty}><Package size={44} /><h2>No orders yet</h2><p>Your sacred purchases will appear here.</p><Link href="/shop">Start shopping</Link></div> : (
                      <div className={styles.orderList}>{data.orders.map((order) => (
                        <article className={styles.orderCard} key={order.id}>
                          <div className={styles.orderTop}><div><span>ORDER PLACED</span><strong>{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</strong></div><div><span>ORDER #</span><strong>{order.orderNumber}</strong></div><div><span>TOTAL</span><strong>₹{Math.round(order.totalAmount).toLocaleString('en-IN')}</strong></div><span className={styles.status}>{order.shippingStatus}</span></div>
                          {order.items.map((item: any) => <div className={styles.orderItem} key={item.id}><div className={styles.productThumb}><img src={item.product?.primaryImage || '/images/rehas-logo.png'} alt="" /></div><div><Link href={`/product/${item.product?.slug || ''}`}>{item.product?.name || 'REHAS merchandise'}</Link><span>Qty: {item.quantity}</span></div><Link className={styles.track} href={`/track-order?orderNumber=${order.orderNumber}`}>Track order</Link></div>)}
                        </article>
                      ))}</div>
                    )}
                  </>
                )}

                {active === 'addresses' && (
                  <>
                    <div className={styles.contentHeader}><div><p>Delivery details</p><h1>Saved Addresses</h1></div><button className={styles.addButton} onClick={() => setShowAddressForm(true)}><Plus size={17} /> Add address</button></div>
                    {message && <div className={styles.message}>{message}</div>}
                    {showAddressForm && <form className={styles.addressForm} onSubmit={saveAddress}>
                      <h2>Add a new address</h2>
                      <div className={styles.formGrid}>
                        {['fullName','phone','flatBuilding','streetArea','landmark','city','state','pinCode'].map((field) => <label key={field} className={field === 'streetArea' ? styles.full : ''}><span>{field === 'pinCode' ? 'PIN code' : field === 'flatBuilding' ? 'House / Flat / Building' : field === 'streetArea' ? 'Street / Area' : field === 'fullName' ? 'Full name' : field === 'phone' ? '10-digit mobile number' : field[0].toUpperCase() + field.slice(1)}{field !== 'landmark' && ' *'}</span><input value={(address as any)[field]} onChange={(e) => setAddress({ ...address, [field]: e.target.value })} required={field !== 'landmark'} inputMode={field === 'phone' || field === 'pinCode' ? 'numeric' : 'text'} maxLength={field === 'phone' ? 10 : field === 'pinCode' ? 6 : 80} /></label>)}
                      </div>
                      <label className={styles.checkbox}><input type="checkbox" checked={address.isDefault} onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })} /> Make this my default address</label>
                      <div className={styles.formActions}><button type="button" className={styles.cancel} onClick={() => setShowAddressForm(false)}>Cancel</button><button type="submit" className={styles.save} disabled={saving}>{saving ? 'Saving…' : 'Save address'}</button></div>
                    </form>}
                    <div className={styles.addressGrid}>{data.user.addresses.map((item: any) => <article className={styles.addressCard} key={item.id}>{item.isDefault && <span className={styles.defaultBadge}>Default</span>}<h3>{item.fullName}</h3><p>{item.flatBuilding}, {item.streetArea}{item.landmark ? `, ${item.landmark}` : ''}<br />{item.city}, {item.state} — {item.pinCode}</p><strong>Phone: {item.phone}</strong><div className={styles.addressActions}><button onClick={() => { setAddress({ id:item.id, fullName:item.fullName, phone:item.phone, flatBuilding:item.flatBuilding, streetArea:item.streetArea, landmark:item.landmark || '', city:item.city, state:item.state, pinCode:item.pinCode, isDefault:item.isDefault }); setShowAddressForm(true); }}><Pencil size={14} /> Edit</button><button onClick={() => deleteAddress(item.id)}><Trash2 size={14} /> Remove</button></div></article>)}</div>
                    {data.user.addresses.length === 0 && !showAddressForm && <div className={styles.empty}><MapPin size={44} /><h2>No saved addresses</h2><p>Add an address for faster checkout.</p><button onClick={() => setShowAddressForm(true)}>Add address</button></div>}
                  </>
                )}

                {active === 'profile' && <><div className={styles.contentHeader}><div><p>Account settings</p><h1>Personal Information</h1></div></div><div className={styles.detailsCard}><div className={styles.infoGrid}><div><span>Full name</span><strong>{data.user.name}</strong></div><div><span>Email address</span><strong>{data.user.email}</strong></div><div><span>Mobile number</span><strong>{data.user.phone || 'Not added'}</strong></div></div><button className={styles.addButton} onClick={() => setActive('overview')}>Done</button></div></>}
              </section>
            </div>
          </>
        ) : <div className={styles.loading}>Could not load your account.</div>}
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
