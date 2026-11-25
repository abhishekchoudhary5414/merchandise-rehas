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
import ProductsListSection from '@/components/admin/products/ProductsListSection';
import AddCategorySection from '@/components/admin/categories/AddCategorySection';
import CategoriesListSection from '@/components/admin/categories/CategoriesListSection';
import CouponsSection from '@/components/admin/coupons/CouponsSection';
import MediaSection from '@/components/admin/media/MediaSection';
import SeoSection from '@/components/admin/seo/SeoSection';
import BlogsSection from '@/components/admin/blogs/BlogsSection';
import AnalyticsSection from '@/components/admin/analytics/AnalyticsSection';
import SettingsSection from '@/components/admin/settings/SettingsSection';
import CustomersSection from '@/components/admin/customers/CustomersSection';
import InquiriesSection from '@/components/admin/inquiries/InquiriesSection';
import InventorySection from '@/components/admin/inventory/InventorySection';
import OrdersSection from '@/components/admin/orders/OrdersSection';
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

  // Real Database Customers State
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  async function fetchCustomersList() {
    setLoadingCustomers(true);
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const data = await res.json();
        if (data.customers) setCustomers(data.customers);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingCustomers(false);
    }
  }

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
    if (section === 'customers') {
      fetchCustomersList();
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

  async function handleStatusChange(orderId: string, shippingStatus: string, paymentStatus?: string) {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, shippingStatus, paymentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                shippingStatus,
                ...(data.order?.paymentStatus ? { paymentStatus: data.order.paymentStatus } : {}),
              }
            : order
        )
      );
      setPopup({
        open: true,
        type: 'success',
        title: 'Order Status Updated',
        message: `${data.message || 'Status successfully updated'}.`,
      });
    } catch (error: any) {
      setPopup({ open: true, type: 'error', title: 'Status Update Failed', message: error.message || 'Could not update status' });
    }
  }

  function handleRefund(orderId: string, amount: number, forceOffline = false) {
    setPopup({
      open: true,
      type: 'confirm',
      title: forceOffline ? 'Confirm Manual / Offline Refund' : 'Confirm Razorpay Refund',
      message: forceOffline
        ? `Mark order as refunded for ${formatINR(amount)} and update customer ledger? (Use this if Razorpay wallet has insufficient merchant balance)`
        : `Are you sure you want to refund ${formatINR(amount)} via Razorpay for this order?`,
      confirmLabel: forceOffline ? 'Mark as Refunded' : 'Issue Refund',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/orders/refund', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              amount,
              reason: 'Customer return and refund',
              forceOfflineRefund: forceOffline,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            if (data.canForceOffline) {
              setPopup({
                open: true,
                type: 'confirm',
                title: 'Razorpay Balance Insufficient',
                message: `${data.error}\n\nWould you like to record this as an offline/direct UPI refund in the database now?`,
                confirmLabel: 'Record Offline Refund',
                danger: false,
                onConfirm: () => handleRefund(orderId, amount, true),
              });
              return;
            }
            throw new Error(data.error || 'Refund failed');
          }

          setOrders((current) =>
            current.map((order) =>
              order.id === orderId
                ? { ...order, paymentStatus: 'REFUNDED', shippingStatus: 'REFUNDED' }
                : order
            )
          );
          recordActivity('Refund Processed', `Refund of ${formatINR(amount)} completed for order.`, 'order');
          setPopup({
            open: true,
            type: 'success',
            title: 'Refund Processed',
            message: data.message || 'Refund completed successfully.',
          });
        } catch (e: any) {
          setPopup({
            open: true,
            type: 'error',
            title: 'Refund Failed',
            message: e.message || 'Could not process refund.',
          });
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
          <RecentOrders orders={orders} onSelectOrders={() => handleSectionChange('orders')} />
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
        <ProductsListSection
          products={products}
          onAddProduct={() => {
            setEditingProduct(null);
            setShowAddProduct(true);
          }}
          onEditProduct={(p) => setEditingProduct(p)}
          onDeleteProduct={handleDeleteProduct}
          onUpdateProductStock={async (productId, newStock) => {
            try {
              const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stockQuantity: newStock }),
              });
              if (!res.ok) throw new Error('Failed to update stock');
              const data = await res.json();
              // Instantly update local state so Total Stock recalculates immediately
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === productId ? { ...p, stockQuantity: newStock, inStock: newStock > 0 } : p
                )
              );
              recordActivity('Stock Updated', `Updated stock for product (${newStock} units available).`, 'system');
              setPopup({
                open: true,
                type: 'success',
                title: 'Stock Updated',
                message: `Product stock updated to ${newStock} units. Total available stock has been recalculated.`,
              });
              return true;
            } catch (err: any) {
              setPopup({
                open: true,
                type: 'error',
                title: 'Stock Update Failed',
                message: err.message || 'Could not update stock quantity.',
              });
              return false;
            }
          }}
        />
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
        <CategoriesListSection
          categories={categories}
          onAddCategory={() => setActiveSection('add-category')}
          onEditCategory={(cat) => setEditingCategory(cat)}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {/* 4. INVENTORY SECTION */}
      {activeSection === 'inventory' && (
        <InventorySection
          onEditProduct={(p) => {
            setEditingProduct(p);
            setActiveSection('products');
          }}
        />
      )}

      {/* 5. ORDERS & RETURNS SECTION */}
      {(activeSection === 'orders' || activeSection === 'returns') && (
        <OrdersSection
          filterMode={activeSection === 'returns' ? 'returns' : 'all'}
          onRefundOrder={(orderId, amount) => handleRefund(orderId, amount)}
          onUpdateStatus={handleStatusChange}
        />
      )}

      {/* 6. CUSTOMERS SECTION */}
      {activeSection === 'customers' && (
        <CustomersSection />
      )}

      {/* 6b. INQUIRIES & WHATSAPP TRACKING SECTION */}
      {activeSection === 'inquiries' && (
        <InquiriesSection />
      )}

      {/* 7. COUPONS SECTION */}
      {activeSection === 'coupons' && (
        <CouponsSection
          coupons={coupons}
          loadingCoupons={loadingCoupons}
          onRefresh={fetchCouponsList}
          onCreateCoupon={handleCreateCoupon}
          onToggleCoupon={handleToggleCoupon}
          onDeleteCoupon={handleDeleteCoupon}
          showCouponForm={showCouponForm}
          setShowCouponForm={setShowCouponForm}
          savingCoupon={savingCoupon}
          newCoupon={newCoupon}
          setNewCoupon={setNewCoupon}
        />
      )}

      {/* 8. SEO STUDIO SECTION */}
      {activeSection === 'seo' && (
        <SeoSection products={products} />
      )}

      {/* 9. MEDIA LIBRARY SECTION */}
      {activeSection === 'media' && (
        <MediaSection />
      )}

      {/* 10. BLOGS SECTION */}
      {activeSection === 'blogs' && (
        <BlogsSection />
      )}

      {/* 11. ANALYTICS SECTION */}
      {activeSection === 'analytics' && (
        <AnalyticsSection overviewData={overviewData} />
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

      {/* 14. SETTINGS SECTION */}
      {activeSection === 'settings' && (
        <SettingsSection
          shippingConfig={shippingConfig}
          setShippingConfig={setShippingConfig}
          savingSettings={savingSettings}
          onSave={handleSaveSettings}
        />
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
