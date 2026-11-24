'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  ShieldCheck
} from 'lucide-react';
import siteConfig from '@/data/site-config.json';
import styles from './Navbar.module.css';

interface NavbarProps {
  cartCount?: number;
}

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveCartCount, setLiveCartCount] = useState(cartCount);

  useEffect(() => {
    function syncCart() {
      try {
        const items = JSON.parse(localStorage.getItem('rehas_cart') || '[]');
        if (Array.isArray(items)) {
          const total = items.reduce((s: number, it: any) => s + (Number(it.quantity) || 1), 0);
          setLiveCartCount(total || cartCount);
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
          <Link href="/#blog" className={styles.navLink}>Blogs</Link>
          <Link href="/#contact" className={styles.navLink}>Contact</Link>
        </nav>

        {/* Action Icons */}
        <div className={styles.actions}>
          <Link href="/shop" className={styles.iconBtn} aria-label="Search bracelets">
            <Search size={20} />
          </Link>
          <Link href="/account" className={styles.iconBtn} aria-label="Account">
            <User size={20} />
          </Link>
          <Link href="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <Heart size={20} />
          </Link>
          <Link href="/cart" className={styles.cartBtn} aria-label="Shopping Cart">
            <ShoppingBag size={20} />
            <span className={styles.cartBadge}>{liveCartCount}</span>
          </Link>
        </div>
      </div>

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
            <Link href="/#blog" onClick={() => setMobileMenuOpen(false)} className={styles.drawerNavLink}>
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
              <span>Wishlist</span>
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
            <Link href="/terms" className={styles.supportLink} onClick={() => setMobileMenuOpen(false)}>
              <ShieldCheck size={18} />
              <span>Terms of Service</span>
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
