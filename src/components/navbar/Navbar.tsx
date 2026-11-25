'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import siteConfig from '@/data/site-config.json';
import styles from './Navbar.module.css';

interface NavbarProps {
  cartCount?: number;
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveCartCount, setLiveCartCount] = useState(cartCount);
  const [liveWishlistCount, setLiveWishlistCount] = useState(0);

  // Search Bar State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync Cart Counter
  useEffect(() => {
    function syncCart() {
      try {
        const items = JSON.parse(localStorage.getItem('rehas_cart') || '[]');
        if (Array.isArray(items)) {
          const total = items.reduce((s: number, it: any) => s + (Number(it.quantity) || 1), 0);
          setLiveCartCount(total);
        }
      } catch {
        setLiveCartCount(cartCount);
      }
    }
    syncCart();
    window.addEventListener('storage', syncCart);
    window.addEventListener('rehas_cart_updated', syncCart);
    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('rehas_cart_updated', syncCart);
    };
  }, [cartCount]);

  // Sync Wishlist Counter
  useEffect(() => {
    function syncWishlist() {
      try {
        const items = JSON.parse(localStorage.getItem('rehas_wishlist') || '[]');
        if (Array.isArray(items)) {
          setLiveWishlistCount(items.length);
        }
      } catch {
        setLiveWishlistCount(0);
      }
    }
    syncWishlist();
    window.addEventListener('storage', syncWishlist);
    window.addEventListener('rehas_wishlist_updated', syncWishlist);
    return () => {
      window.removeEventListener('storage', syncWishlist);
      window.removeEventListener('rehas_wishlist_updated', syncWishlist);
    };
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
    }
  }, [searchOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Left Side in Mobile View: Hamburger Button and Brand Logo */}
        <div className={styles.leftGroup}>
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            type="button"
          >
            <Menu size={24} />
          </button>

          {/* Brand Logo with Emblem */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoImageWrap}>
              <Image
                src={siteConfig.brand.logo}
                alt={`${siteConfig.brand.name} Logo`}
                width={44}
                height={44}
                className={styles.logoImg}
                priority
              />
            </div>
            <div className={styles.logoTextCol}>
              <span className={styles.logoMain}>{siteConfig.brand.name}</span>
              <span className={styles.logoSub}>
                <Sparkles size={10} className={styles.sparkle} /> {siteConfig.brand.subName}
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.navDesktop}>
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}
          >
            Home
          </Link>
          <Link
            href="/shop"
            className={`${styles.navLink} ${
              pathname.startsWith('/shop') || pathname.startsWith('/product') ? styles.navLinkActive : ''
            }`}
          >
            Bracelets
          </Link>
          <Link href="/#categories" className={styles.navLink}>Category</Link>
          <Link href="/#about" className={styles.navLink}>About</Link>
          <Link
            href="/blog"
            className={`${styles.navLink} ${pathname.startsWith('/blog') ? styles.navLinkActive : ''}`}
          >
            Blogs
          </Link>
          <Link href="/#contact" className={styles.navLink}>Contact</Link>
        </nav>

        {/* Action Icons */}
        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.iconBtn} 
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-label="Search bracelets"
          >
            <Search size={20} />
          </button>
          
          <Link href="/account" className={styles.iconBtn} aria-label="Account">
            <User size={20} />
          </Link>

          <Link href="/wishlist" className={styles.wishlistBtn} aria-label="Wishlist">
            <Heart size={20} />
            {liveWishlistCount > 0 && (
              <span className={styles.wishlistBadge}>{liveWishlistCount}</span>
            )}
          </Link>

          <Link href="/cart" className={styles.cartBtn} aria-label="Shopping Cart">
            <ShoppingBag size={20} />
            {liveCartCount > 0 && (
              <span className={styles.cartBadge}>{liveCartCount}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Interactive Search Overlay Bar */}
      {searchOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearchSubmit} className={styles.searchInputWrap}>
              <Search size={18} className={styles.searchIconInside} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search consecrated bracelets, crystal name, intention or zodiac..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </form>
            <button
              type="button"
              onClick={handleSearchSubmit}
              className={styles.searchSubmitBtn}
            >
              <span>Search</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className={styles.searchCloseBtn}
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Backdrop Overlay when mobile drawer is open */}
      <div 
        className={mobileMenuOpen ? styles.backdropActive : styles.backdrop}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer sliding from LEFT with 100% full height */}
      <aside 
        className={mobileMenuOpen ? styles.drawerOpen : styles.drawerClosed}
        aria-label="Mobile navigation menu"
      >
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerBrand}>
            <div className={styles.drawerLogoWrap}>
              <Image
                src={siteConfig.brand.logo}
                alt={`${siteConfig.brand.name} Logo`}
                width={36}
                height={36}
                className={styles.drawerLogoImg}
              />
            </div>
            <div>
              <span className={styles.drawerBrandName}>{siteConfig.brand.name}</span>
              <span className={styles.drawerBrandSub}>{siteConfig.brand.tagline}</span>
            </div>
          </div>
          <button 
            type="button" 
            className={styles.drawerCloseBtn}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Scrollable Navigation Links */}
        <div className={styles.drawerBody}>
          {/* Mobile Search Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!searchQuery.trim()) return;
              setMobileMenuOpen(false);
              router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            }}
            style={{ marginBottom: '12px' }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--primary)' }} />
              <input 
                type="text" 
                placeholder="Search sacred bracelets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  padding: '0 12px 0 36px',
                  fontSize: '13px',
                  outline: 'none',
                  background: '#FAF5FC'
                }}
              />
            </div>
          </form>

          <nav className={styles.drawerNav}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={styles.drawerNavLink}>
              <span>Home</span>
              <ChevronRight size={16} className={styles.drawerNavChevron} />
            </Link>
            <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className={styles.drawerNavLink}>
              <span>Bracelets</span>
              <ChevronRight size={16} className={styles.drawerNavChevron} />
            </Link>
            <Link href="/#categories" onClick={() => setMobileMenuOpen(false)} className={styles.drawerNavLink}>
              <span>Category</span>
              <ChevronRight size={16} className={styles.drawerNavChevron} />
            </Link>
            <Link href="/#about" onClick={() => setMobileMenuOpen(false)} className={styles.drawerNavLink}>
              <span>About</span>
              <ChevronRight size={16} className={styles.drawerNavChevron} />
            </Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className={styles.drawerNavLink}>
              <span>Blogs</span>
              <ChevronRight size={16} className={styles.drawerNavChevron} />
            </Link>
            <Link href="/#contact" onClick={() => setMobileMenuOpen(false)} className={styles.drawerNavLink}>
              <span>Contact</span>
              <ChevronRight size={16} className={styles.drawerNavChevron} />
            </Link>
          </nav>

          {/* Divider Line */}
          <div className={styles.drawerDivider} />

          {/* Drawer Actions: Account, Cart, Wishlist */}
          <div className={styles.drawerActions}>
            <Link href="/account" onClick={() => setMobileMenuOpen(false)} className={styles.drawerActionBtn}>
              <User size={20} />
              <span>Account</span>
            </Link>
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className={styles.drawerActionBtn}>
              <Heart size={20} />
              <span>Wishlist ({liveWishlistCount})</span>
            </Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className={styles.drawerActionBtn}>
              <ShoppingBag size={20} />
              <span>Cart ({liveCartCount})</span>
            </Link>
          </div>

          {/* Support Links */}
          <div className={styles.supportLinks}>
            <Link href="tel:+1234567890" className={styles.supportLink} onClick={() => setMobileMenuOpen(false)}>
              <Phone size={18} />
              <span>+1 (234) 567-890</span>
            </Link>
            <Link href="mailto:support@example.com" className={styles.supportLink} onClick={() => setMobileMenuOpen(false)}>
              <Mail size={18} />
              <span>support@example.com</span>
            </Link>
            <Link href="/shipping-policy" className={styles.supportLink} onClick={() => setMobileMenuOpen(false)}>
              <ShieldCheck size={18} />
              <span>Shipping Policy</span>
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
