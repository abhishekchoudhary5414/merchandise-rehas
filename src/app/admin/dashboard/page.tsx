'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { DashboardSection } from '@/components/admin/layout/Sidebar';
import WelcomeSection from '@/components/admin/dashboard/WelcomeSection';
import StatsCards from '@/components/admin/dashboard/StatsCards';
import RevenueChart, { RevenuePoint } from '@/components/admin/dashboard/RevenueChart';
import OrderChart, { OrderStatusPoint } from '@/components/admin/dashboard/OrderChart';
import CategoryChart, { CategoryPoint } from '@/components/admin/dashboard/CategoryChart';
import PaymentChart, { PaymentPoint } from '@/components/admin/dashboard/PaymentChart';
import LowStockProducts, { LowStockItem } from '@/components/admin/dashboard/LowStockProducts';
import RecentOrders from '@/components/admin/dashboard/RecentOrders';
import AccountSection from '@/components/admin/account/AccountSection';
import NotificationsSection, { ActivityNotification } from '@/components/admin/notifications/NotificationsSection';
import AddProductSection from '@/components/admin/products/AddProductSection';
import AddCategorySection from '@/components/admin/categories/AddCategorySection';
import SectionSkeleton from '@/components/admin/common/SectionSkeleton';
import PopupModal, { PopupState } from '@/components/admin/common/PopupModal';

// Material UI Icons
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import { formatINR } from '@/lib/india-localization';
import styles from '@/components/admin/common/AdminSection.module.css';

export default function AdminDashboardMainPage() {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSwitchingSection, setIsSwitchingSection] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [popup, setPopup] = useState<PopupState>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPct: '10',
    minOrderValue: '499',
    maxDiscount: '',
    isActive: true,
  });

  async function fetchCouponsList() {
    setLoadingCoupons(true);
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        if (data.coupons) setCoupons(data.coupons);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingCoupons(false);
    }
  }
  const [overviewData, setOverviewData] = useState<{
    kpis: {
      totalRevenue: number;
      totalOrders: number;
      totalCustomers: number;
      totalProducts: number;
      avgOrderValue: number;
      lowStockCount: number;
    };
    revenueSeries: RevenuePoint[];
    orderStatusSeries: OrderStatusPoint[];
    paymentMethodSeries: PaymentPoint[];
    categorySeries: CategoryPoint[];
    lowStockProducts: LowStockItem[];
  } | null>(null);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([
    {
      id: 'init-1',
      title: 'Admin Session Started',
      description: 'merchandise.rehas@gmail.com signed in to REHAS Merchandise Admin.',
      type: 'security',
      timestamp: 'Just now',
      unread: true,
    },
    {
      id: 'init-2',
      title: 'Storefront Sync Active',
      description: 'Product catalog and Neon PostgreSQL database connected.',
      type: 'system',
      timestamp: 'Today',
      unread: false,
    },
  ]);

  function recordActivity(title: string, description: string, type: ActivityNotification['type'] = 'system') {
    const newItem: ActivityNotification = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      description,
      type,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      unread: true,
    };
    setNotifications((prev) => [newItem, ...prev]);
  }

  function handleSectionChange(section: DashboardSection) {
    setActiveSection(section);
    setShowAddProduct(false);
    setEditingProduct(null);
    setEditingCategory(null);
    setIsSwitchingSection(true);
    setTimeout(() => setIsSwitchingSection(false), 180);
    recordActivity('Section Viewed', `Navigated to ${section} section.`, 'system');
    if (section === 'coupons') {
      fetchCouponsList();
    }
  }

  function handleDeleteProduct(product: any) {
    setPopup({
      open: true,
      type: 'confirm',
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.name}"? Its uploaded images and videos on Google Drive will also be permanently deleted.`,
      confirmLabel: 'Delete Product',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete product');
          setProducts((prev) => prev.filter((p) => p.id !== product.id));
          recordActivity('Product Deleted', `Deleted product "${product.name}" (${product.sku}).`, 'system');
          setPopup({ open: true, type: 'success', title: 'Product Deleted', message: `"${product.name}" has been deleted.` });
        } catch (e: any) {
          setPopup({ open: true, type: 'error', title: 'Delete Failed', message: e.message || 'Could not delete product.' });
        }
      },
    });
  }

  function handleDeleteCategory(cat: any) {
    setPopup({
      open: true,
      type: 'confirm',
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${cat.name}"?`,
      confirmLabel: 'Delete Category',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to delete category');
          setCategories((prev) => prev.filter((c) => c.id !== cat.id));
          recordActivity('Category Deleted', `Deleted category "${cat.name}".`, 'system');
          setPopup({ open: true, type: 'success', title: 'Category Deleted', message: `"${cat.name}" has been deleted.` });
        } catch (e: any) {
          setPopup({ open: true, type: 'error', title: 'Cannot Delete Category', message: e.message || 'Could not delete category.' });
        }
      },
    });
  }

  function getSkeletonVariant(section: DashboardSection): 'overview' | 'table' | 'form' | 'cards' {
    switch (section) {
      case 'overview':
        return 'overview';
      case 'add-product':
      case 'add-category':
      case 'settings':
      case 'account':
        return 'form';
      case 'notifications':
      case 'seo':
      case 'media':
      case 'blogs':
      case 'analytics':
        return 'cards';
      default:
        return 'table';
    }
  }

  // Shipping & General Settings
  const [shippingConfig, setShippingConfig] = useState({
    freeShippingThreshold: 999,
    flatRate: 79,
    codEnabled: true,
    codFee: 49,
    gstPercentage: 18,
    serviceablePinCodes: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, productsRes, shippingRes, overviewRes, categoriesRes, couponsRes] = await Promise.all([
          fetch('/api/admin/orders').catch(() => null),
          fetch('/api/admin/products').catch(() => null),
          fetch('/api/admin/settings/shipping').catch(() => null),
          fetch('/api/admin/overview').catch(() => null),
          fetch('/api/admin/categories').catch(() => null),
          fetch('/api/admin/coupons').catch(() => null),
        ]);

        if (ordersRes && ordersRes.ok) {
          const data = await ordersRes.json();
          if (data.orders) setOrders(data.orders);
        }

        if (productsRes && productsRes.ok) {
          const data = await productsRes.json();
          if (data.products) setProducts(data.products);
        }

        if (shippingRes && shippingRes.ok) {
          const data = await shippingRes.json();
          if (data.config) setShippingConfig(data.config);
        }

        if (overviewRes && overviewRes.ok) {
          const data = await overviewRes.json();
          if (data.kpis) setOverviewData(data);
        }

        if (categoriesRes && categoriesRes.ok) {
          const data = await categoriesRes.json();
          if (data.categories) setCategories(data.categories);
        }

        if (couponsRes && couponsRes.ok) {
          const data = await couponsRes.json();
          if (data.coupons) setCoupons(data.coupons);
        }
      } catch (e) {
        console.error('Error fetching admin data:', e);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  function handleRefund(orderId: string, amount: number) {
    setPopup({
      open: true,
      type: 'confirm',
      title: 'Confirm Razorpay Refund',
      message: `Are you sure you want to refund ${formatINR(amount)} via Razorpay for this order?`,
      confirmLabel: 'Issue Refund',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/orders/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, amount, reason: 'Approved refund' }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Refund failed');
          recordActivity('Refund Processed', `Refund of ${formatINR(amount)} initiated for order.`, 'order');
          setPopup({ open: true, type: 'success', title: 'Refund Processed', message: data.message || 'Refund completed successfully.' });
        } catch (e: any) {
          setPopup({ open: true, type: 'error', title: 'Refund Failed', message: e.message || 'Could not process refund.' });
        }
      },
    });
  }

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    setSavingCoupon(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create coupon');
      setCoupons((prev) => [data.coupon, ...prev]);
      setNewCoupon({ code: '', discountPct: '10', minOrderValue: '499', maxDiscount: '', isActive: true });
      setShowCouponForm(false);
      recordActivity('Coupon Created', `Created coupon "${data.coupon.code}" (${data.coupon.discountPct}% off).`, 'system');
      setPopup({ open: true, type: 'success', title: 'Coupon Created', message: `Coupon "${data.coupon.code}" is now saved in Neon DB.` });
    } catch (e: any) {
      setPopup({ open: true, type: 'error', title: 'Coupon Error', message: e.message || 'Could not create coupon.' });
    } finally {
      setSavingCoupon(false);
    }
  }

  async function handleToggleCoupon(coupon: any) {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update coupon');
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? data.coupon : c)));
      recordActivity('Coupon Updated', `${coupon.code} marked ${data.coupon.isActive ? 'Active' : 'Inactive'}.`, 'system');
    } catch (e: any) {
      setPopup({ open: true, type: 'error', title: 'Update Failed', message: e.message || 'Could not update coupon.' });
    }
  }

  function handleDeleteCoupon(coupon: any) {
    setPopup({
      open: true,
      type: 'confirm',
      title: 'Delete Coupon',
      message: `Are you sure you want to delete coupon "${coupon.code}"?`,
      confirmLabel: 'Delete Coupon',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete coupon');
          setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
          recordActivity('Coupon Deleted', `Deleted coupon "${coupon.code}".`, 'system');
        } catch (e: any) {
          setPopup({ open: true, type: 'error', title: 'Delete Failed', message: e.message || 'Could not delete coupon.' });
        }
      },
    });
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingConfig),
      });
      if (res.ok) {
        recordActivity('Settings Updated', 'Shipping & GST configuration saved.', 'system');
        setPopup({ open: true, type: 'success', title: 'Settings Saved', message: 'Store shipping & GST settings updated successfully!' });
      } else {
        setPopup({ open: true, type: 'error', title: 'Save Failed', message: 'Could not save store settings.' });
      }
    } catch (e: any) {
      setPopup({ open: true, type: 'error', title: 'Error', message: e.message || 'An error occurred while saving.' });
    } finally {
      setSavingSettings(false);
    }
  }

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  function getSectionTitle(): { title: string; breadcrumb: string } {
    switch (activeSection) {
      case 'overview':
        return { title: 'Dashboard Overview', breadcrumb: 'REHAS / Merchandise / Dashboard' };
      case 'products':
        return { title: 'Product Collection', breadcrumb: 'REHAS / Merchandise / Products' };
      case 'add-product':
        return { title: 'Add New Product', breadcrumb: 'REHAS / Merchandise / Add Product' };
      case 'categories':
        return { title: 'Merchandise Categories', breadcrumb: 'REHAS / Merchandise / Categories' };
      case 'add-category':
        return { title: 'Add New Category', breadcrumb: 'REHAS / Merchandise / Add Category' };
      case 'inventory':
        return { title: 'Inventory & Stock Logistics', breadcrumb: 'REHAS / Merchandise / Inventory' };
      case 'orders':
        return { title: 'Customer Orders', breadcrumb: 'REHAS / Merchandise / Orders' };
      case 'returns':
        return { title: 'Returns & Razorpay Refunds', breadcrumb: 'REHAS / Merchandise / Returns' };
      case 'customers':
        return { title: 'Customer Directory', breadcrumb: 'REHAS / Merchandise / Customers' };
      case 'coupons':
        return { title: 'Discounts & Coupons', breadcrumb: 'REHAS / Merchandise / Marketing' };
      case 'seo':
        return { title: 'Google SEO & Social Studio', breadcrumb: 'REHAS / Merchandise / SEO' };
      case 'media':
        return { title: 'Google Drive Media Library', breadcrumb: 'REHAS / Merchandise / Media' };
      case 'blogs':
        return { title: 'Astrology & Energy Blog Articles', breadcrumb: 'REHAS / Merchandise / Blogs' };
      case 'analytics':
        return { title: 'Store Sales Analytics', breadcrumb: 'REHAS / Merchandise / Analytics' };
      case 'notifications':
        return { title: 'Notifications & Activity', breadcrumb: 'REHAS / Merchandise / Notifications' };
      case 'account':
        return { title: 'Admin Account', breadcrumb: 'REHAS / Merchandise / Account' };
      case 'settings':
        return { title: 'Shipping & Tax Settings', breadcrumb: 'REHAS / Merchandise / Settings' };
      default:
        return { title: 'Admin Command Center', breadcrumb: 'REHAS / Merchandise' };
    }
  }

  const { title, breadcrumb } = getSectionTitle();

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <AdminLayout
      pageTitle={title}
      breadcrumb={breadcrumb}
      activeSection={activeSection}
      onSelectSection={handleSectionChange}
      unreadCount={unreadCount}
    >
      {(isLoadingData || isSwitchingSection) ? (
        <SectionSkeleton variant={getSkeletonVariant(activeSection)} />
      ) : (
        <>
          {/* 1. OVERVIEW SECTION */}
      {activeSection === 'overview' && (
        <>
          <WelcomeSection
            onAddProduct={() => {
              setActiveSection('products');
              setShowAddProduct(true);
            }}
          />
          <StatsCards
            totalRevenue={overviewData?.kpis.totalRevenue ?? totalRevenue}
            totalOrders={overviewData?.kpis.totalOrders ?? orders.length}
            totalCustomers={overviewData?.kpis.totalCustomers ?? 0}
            totalProducts={overviewData?.kpis.totalProducts ?? products.length}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <RevenueChart data={overviewData?.revenueSeries || []} />
            <OrderChart data={overviewData?.orderStatusSeries || []} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <CategoryChart data={overviewData?.categorySeries || []} />
            <PaymentChart data={overviewData?.paymentMethodSeries || []} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <LowStockProducts
              items={overviewData?.lowStockProducts || []}
              onUpdateStock={(productId) => {
                const found = products.find((p) => p.id === productId);
                if (found) {
                  setEditingProduct(found);
                  setActiveSection('products');
                }
              }}
            />
          </div>
          <RecentOrders orders={orders} />
        </>
      )}

      {/* 2B. SEPARATE ADD PRODUCT SECTION */}
      {activeSection === 'add-product' && (
        <AddProductSection
          onCancel={() => setActiveSection('products')}
          onSuccess={(newProd) => {
            setProducts((prev) => [newProd, ...prev]);
            setActiveSection('products');
            recordActivity('Product Added', `Added ${newProd.name} (${newProd.sku}) to catalog.`, 'system');
          }}
        />
      )}

      {/* 2. PRODUCTS SECTION */}
      {activeSection === 'products' && (showAddProduct || editingProduct) && (
        <AddProductSection
          initialProduct={editingProduct}
          onCancel={() => {
            setShowAddProduct(false);
            setEditingProduct(null);
          }}
          onSuccess={(savedProd, isEdit) => {
            if (isEdit) {
              setProducts((prev) =>
                prev.map((p) => (p.id === savedProd.id ? { ...savedProd, soldCount: p.soldCount } : p))
              );
              recordActivity('Product Updated', `Updated ${savedProd.name} (${savedProd.sku}).`, 'system');
            } else {
              setProducts((prev) => [savedProd, ...prev]);
              recordActivity('Product Added', `Added ${savedProd.name} (${savedProd.sku}) to catalog.`, 'system');
            }
            setShowAddProduct(false);
            setEditingProduct(null);
          }}
        />
      )}

      {activeSection === 'products' && !showAddProduct && !editingProduct && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>Sacred Merchandise Collection</h2>
              <span className={styles.subTitle}>Manage consecrated merchandise, pricing & inventory</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setShowAddProduct(true);
              }}
              className={styles.primaryBtn}
            >
              <AddCircleOutlineOutlinedIcon fontSize="small" />
              <span>Add Product</span>
            </button>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No products found. Create your first product.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.sku}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{typeof p.category === 'object' ? p.category?.name : (p.category || 'Astrology')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(p.price)}</td>
                      <td>{p.stockQuantity ?? 0} units</td>
                      <td>
                        <span className={`${styles.badge} ${p.stockQuantity > 0 ? styles.badgeActive : styles.badgeDraft}`}>
                          {p.stockQuantity > 0 ? 'Active' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            style={{
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(86, 0, 103, 0.2)',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <EditOutlinedIcon fontSize="inherit" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            style={{
                              background: '#fef2f2',
                              color: 'var(--danger)',
                              border: '1px solid #fecaca',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <DeleteOutlinedIcon fontSize="inherit" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3B. SEPARATE ADD CATEGORY SECTION */}
      {activeSection === 'add-category' && (
        <AddCategorySection
          onCancel={() => setActiveSection('categories')}
          onSuccess={(newCat) => {
            setCategories((prev) => [...prev, newCat]);
            setActiveSection('categories');
            recordActivity('Category Added', `Created category "${newCat.name}".`, 'system');
          }}
        />
      )}

      {/* 3. CATEGORIES SECTION (with Edit Category support) */}
      {activeSection === 'categories' && editingCategory && (
        <AddCategorySection
          initialCategory={editingCategory}
          onCancel={() => setEditingCategory(null)}
          onSuccess={(savedCat, isEdit) => {
            if (isEdit) {
              setCategories((prev) =>
                prev.map((c) => (c.id === savedCat.id ? savedCat : c))
              );
              recordActivity('Category Updated', `Updated category "${savedCat.name}".`, 'system');
            }
            setEditingCategory(null);
          }}
        />
      )}

      {activeSection === 'categories' && !editingCategory && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>Merchandise Categories</h2>
              <span className={styles.subTitle}>Natural crystal, sacred rudraksha & astrological alignment styles</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSection('add-category')}
              className={styles.primaryBtn}
            >
              <CategoryIcon fontSize="small" />
              <span>Add Category</span>
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Category Name</th>
                  <th>Slug</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        <img
                          src={cat.imageUrl || '/images/rehas-logo.png'}
                          alt={cat.name}
                          referrerPolicy="no-referrer"
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1px solid var(--border)',
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{cat.name}</td>
                      <td style={{ fontFamily: 'monospace' }}>{cat.slug}</td>
                      <td>{cat._count?.products ?? 0} products</td>
                      <td><span className={`${styles.badge} ${styles.badgeActive}`}>Active</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(cat)}
                            style={{
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(86, 0, 103, 0.2)',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <EditOutlinedIcon fontSize="inherit" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            style={{
                              background: '#fef2f2',
                              color: 'var(--danger)',
                              border: '1px solid #fecaca',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <DeleteOutlinedIcon fontSize="inherit" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. INVENTORY SECTION */}
      {activeSection === 'inventory' && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>Inventory &amp; Sales Control</h2>
              <span className={styles.subTitle}>Live stock counts, units sold &amp; low inventory warnings</span>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item SKU</th>
                  <th>Merchandise Item</th>
                  <th>Units Sold</th>
                  <th>Available Stock</th>
                  <th>Stock Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const qty = p.stockQuantity ?? 0;
                    const sold = p.soldCount ?? 0;
                    const statusLabel = qty === 0 ? 'Out of Stock' : qty <= 5 ? 'Low Stock' : 'In Stock';
                    return (
                      <tr key={p.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.sku}</td>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{sold} sold</td>
                        <td>{qty} units</td>
                        <td>
                          <span className={`${styles.badge} ${qty > 5 ? styles.badgeActive : styles.badgeDraft}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setActiveSection('products');
                            }}
                            style={{
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(86, 0, 103, 0.2)',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <EditOutlinedIcon fontSize="inherit" />
                            <span>Update</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ORDERS & RETURNS SECTION */}
      {(activeSection === 'orders' || activeSection === 'returns') && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>
                {activeSection === 'orders' ? 'Customer Orders' : 'Returns & Refunds'}
              </h2>
              <span className={styles.subTitle}>
                {activeSection === 'orders'
                  ? 'All completed orders and fulfillment stages'
                  : 'Customer return requests and Razorpay refunds'}
              </span>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Location</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Fulfillment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{o.orderNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.customerName}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{o.customerPhone}</div>
                      </td>
                      <td>{o.city}, {o.pinCode}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatINR(o.totalAmount)}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeActive}`}>
                          {o.paymentMethod} · {o.paymentStatus}
                        </span>
                      </td>
                      <td>{o.shippingStatus}</td>
                      <td>
                        {o.paymentStatus === 'PAID' && (
                          <button
                            onClick={() => handleRefund(o.id, o.totalAmount)}
                            style={{
                              background: '#fef2f2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <RotateLeftIcon fontSize="inherit" /> Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. CUSTOMERS SECTION */}
      {activeSection === 'customers' && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>Registered Boutique Patrons</h2>
              <span className={styles.subTitle}>Customer profiles, contact data & purchase history</span>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Abhishek Sharma</td>
                  <td>merchandise.rehas@gmail.com</td>
                  <td>+91 98765 43210</td>
                  <td>3 orders</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹4,497</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. COUPONS SECTION */}
      {activeSection === 'coupons' && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>Coupons & Promotional Discounts</h2>
              <span className={styles.subTitle}>
                Create and manage live discount coupons. Only coupons saved in database are shown below.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={fetchCouponsList}
                disabled={loadingCoupons}
                title="Refresh coupons from database"
              >
                <span>{loadingCoupons ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setShowCouponForm((v) => !v)}
              >
                <ConfirmationNumberIcon fontSize="small" />
                <span>{showCouponForm ? 'Close Form' : 'Create Coupon'}</span>
              </button>
            </div>
          </div>

          {showCouponForm && (
            <form
              onSubmit={handleCreateCoupon}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                padding: '16px',
                marginBottom: '20px',
                background: 'var(--primary-light)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="WELCOME10"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Discount (%) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={90}
                  value={newCoupon.discountPct}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountPct: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Min Order (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={newCoupon.minOrderValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Max Discount (₹, optional)
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="No cap"
                  value={newCoupon.maxDiscount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <button type="submit" disabled={savingCoupon} className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center' }}>
                  {savingCoupon ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          )}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Max Cap</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                      No coupons found in database. Click &ldquo;Create Coupon&rdquo; to add one (e.g. WELCOME10 for 10% off).
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{c.code}</td>
                      <td>{c.discountPct}% OFF</td>
                      <td>{formatINR(c.minOrderValue)}</td>
                      <td>{c.maxDiscount ? formatINR(c.maxDiscount) : 'No cap'}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(c)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          title="Click to toggle Active/Inactive"
                        >
                          <span className={`${styles.badge} ${c.isActive ? styles.badgeActive : styles.badgePending}`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. SEO STUDIO SECTION */}
      {activeSection === 'seo' && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>SEO & Social Preview Studio</h2>
              <span className={styles.subTitle}>Search snippets, meta descriptions & Open Graph previews</span>
            </div>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            All sacred merchandise products are indexed with automatic canonical URLs and Google Rich Snippet JSON-LD schema.
          </p>
        </div>
      )}

      {/* 9. MEDIA LIBRARY SECTION */}
      {activeSection === 'media' && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>Google Drive Media Assets</h2>
              <span className={styles.subTitle}>Product photography & high-resolution consecrated images</span>
            </div>
            <button className={styles.primaryBtn}>
              <PermMediaIcon fontSize="small" />
              <span>Upload to Drive</span>
            </button>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Connected folder: <strong>REHAS Merchandise Assets</strong> (ID: <code>1ZI4__1WdzC5NvbTN0mfdeH2WOtX-VXLR</code>)
          </p>
        </div>
      )}

      {/* 10. BLOGS SECTION */}
      {activeSection === 'blogs' && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>Vedic Astrology & Energy Articles</h2>
              <span className={styles.subTitle}>Spiritual guidance, gemstone energies & astrological alignments</span>
            </div>
            <button className={styles.primaryBtn}>
              <ArticleIcon fontSize="small" />
              <span>New Article</span>
            </button>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Publish consecrated wisdom and care instructions for patrons.
          </p>
        </div>
      )}

      {/* 11. ANALYTICS SECTION */}
      {activeSection === 'analytics' && (
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>Store Sales Analytics</h2>
              <span className={styles.subTitle}>Live financial turnover, average cart value & fulfillment velocity</span>
            </div>
          </div>
          <RevenueChart data={overviewData?.revenueSeries || []} />
        </div>
      )}

      {/* 12. NOTIFICATIONS & ACTIVITY SECTION */}
      {activeSection === 'notifications' && (
        <NotificationsSection
          notifications={notifications}
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
          }
        />
      )}

      {/* 13. ACCOUNT SECTION */}
      {activeSection === 'account' && (
        <AccountSection onActivity={recordActivity} />
      )}

      {/* 12. SETTINGS SECTION */}
      {activeSection === 'settings' && (
        <div className={styles.card} style={{ maxWidth: '640px' }}>
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h2 className={styles.title}>Indian Shipping & Tax Settings</h2>
              <span className={styles.subTitle}>Configure delivery fees, free shipping thresholds, GST & COD</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Free Shipping Threshold (INR ₹)
              </label>
              <input
                type="number"
                value={shippingConfig.freeShippingThreshold}
                onChange={(e) =>
                  setShippingConfig({ ...shippingConfig, freeShippingThreshold: parseFloat(e.target.value) || 0 })
                }
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Standard Delivery Fee (INR ₹)
              </label>
              <input
                type="number"
                value={shippingConfig.flatRate}
                onChange={(e) =>
                  setShippingConfig({ ...shippingConfig, flatRate: parseFloat(e.target.value) || 0 })
                }
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                GST Rate (%)
              </label>
              <input
                type="number"
                value={shippingConfig.gstPercentage}
                onChange={(e) =>
                  setShippingConfig({ ...shippingConfig, gstPercentage: parseFloat(e.target.value) || 0 })
                }
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className={styles.primaryBtn}
              style={{ marginTop: '0.5rem', justifyContent: 'center' }}
            >
              <SaveOutlinedIcon fontSize="small" />
              <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      )}
        </>
      )}

      <PopupModal
        popup={popup}
        onClose={() => setPopup((prev) => ({ ...prev, open: false }))}
      />
    </AdminLayout>
  );
}
