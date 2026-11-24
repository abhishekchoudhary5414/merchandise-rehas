'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CategoryIcon from '@mui/icons-material/Category';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import PeopleIcon from '@mui/icons-material/People';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';

import siteConfig from '@/data/site-config.json';
import styles from './Sidebar.module.css';

export type DashboardSection =
  | 'overview'
  | 'products'
  | 'add-product'
  | 'categories'
  | 'add-category'
  | 'inventory'
  | 'orders'
  | 'returns'
  | 'customers'
  | 'coupons'
  | 'seo'
  | 'media'
  | 'blogs'
  | 'analytics'
  | 'notifications'
  | 'account'
  | 'settings';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
}

const navSections: {
  title: string;
  items: { label: string; section: DashboardSection; icon: any }[];
}[] = [
  {
    title: 'Dashboard',
    items: [
      { label: 'Overview', section: 'overview', icon: DashboardIcon },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { label: 'Products', section: 'products', icon: Inventory2Icon },
      { label: 'Add Product', section: 'add-product', icon: AddCircleOutlineOutlinedIcon },
      { label: 'Categories', section: 'categories', icon: CategoryIcon },
      { label: 'Add Category', section: 'add-category', icon: AddCircleOutlineOutlinedIcon },
      { label: 'Inventory', section: 'inventory', icon: WarehouseIcon },
    ],
  },
  {
    title: 'Orders',
    items: [
      { label: 'All Orders', section: 'orders', icon: ShoppingBagIcon },
      { label: 'Returns & Refunds', section: 'returns', icon: AssignmentReturnIcon },
    ],
  },
  {
    title: 'Customers',
    items: [
      { label: 'Customers', section: 'customers', icon: PeopleIcon },
    ],
  },
  {
    title: 'Marketing & SEO',
    items: [
      { label: 'Coupons', section: 'coupons', icon: ConfirmationNumberIcon },
      { label: 'SEO Studio', section: 'seo', icon: SearchIcon },
      { label: 'Media Library', section: 'media', icon: PermMediaIcon },
      { label: 'Blog Articles', section: 'blogs', icon: ArticleIcon },
    ],
  },
  {
    title: 'Analytics & Config',
    items: [
      { label: 'Sales Analytics', section: 'analytics', icon: AssessmentIcon },
      { label: 'Notifications', section: 'notifications', icon: NotificationsNoneIcon },
      { label: 'Account', section: 'account', icon: AccountCircleOutlinedIcon },
      { label: 'Store Settings', section: 'settings', icon: SettingsIcon },
    ],
  },
];

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  activeSection,
  onSelectSection,
}: SidebarProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
      router.push('/admin/login');
    }
  }

  function handleItemClick(section: DashboardSection) {
    onSelectSection(section);
    onCloseMobile();
  }

  return (
    <>
      {mobileOpen && <div className={styles.overlay} onClick={onCloseMobile} />}

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''} ${
          mobileOpen ? styles.sidebarOpenMobile : ''
        }`}
      >
        {/* Brand Header with Official Logo */}
        <div className={styles.logoArea}>
          <Link
            href="/admin/dashboard"
            className={styles.logoLink}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleItemClick('overview');
            }}
          >
            <div className={styles.officialLogoWrap}>
              <Image
                src={siteConfig.brand.logo}
                alt="REHAS Brand Emblem"
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            {!collapsed && (
              <div className={styles.brandInfo}>
                <span className={styles.brandName}>REHAS</span>
                <span className={styles.brandRole}>Merchandise Admin</span>
              </div>
            )}
          </Link>

          {/* Desktop/Laptop ONLY Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className={styles.collapseToggle}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </button>

          {/* Mobile ONLY Close Drawer Button */}
          <button
            onClick={onCloseMobile}
            className={styles.mobileCloseBtn}
            title="Close Menu"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Navigation Sections & Custom Scrollbar */}
        <div className={styles.navContainer}>
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && <div className={styles.sectionHeader}>{section.title}</div>}
              <ul className={styles.navList}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.section;
                  return (
                    <li key={item.label} className={styles.navItem}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(item.section)}
                        className={`${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className={styles.navIcon} />
                        {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Profile Footer */}
        <div className={styles.profileArea}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>R</div>
            {!collapsed && (
              <div className={styles.profileMeta}>
                <span className={styles.profileName}>REHAS Admin</span>
                <span className={styles.profileEmail}>merchandise.rehas@gmail.com</span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={styles.logoutBtn}
            title="Sign Out"
          >
            <LogoutIcon fontSize="small" />
          </button>
        </div>
      </aside>
    </>
  );
}
