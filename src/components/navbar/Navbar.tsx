'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CircularProgress from '@mui/material/CircularProgress';
import siteConfig from '@/data/site-config.json';
import { formatINR } from '@/lib/india-localization';
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

  // Search Bar State & Live Instant Results
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Live matching query as user types (no need to press Enter or click search)
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

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
            <MenuIcon style={{ fontSize: 28 }} />
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
                <AutoAwesomeIcon style={{ fontSize: 11 }} className={styles.sparkle} /> {siteConfig.brand.subName}
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
          <Link href="/about" className={styles.navLink}>About</Link>
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
            <SearchIcon style={{ fontSize: 22 }} />
          </button>
          
          <Link href="/account" className={styles.iconBtn} aria-label="Account">
            <PersonOutlineIcon style={{ fontSize: 24 }} />
          </Link>

          <Link href="/wishlist" className={styles.wishlistBtn} aria-label="Wishlist">
            <FavoriteBorderIcon style={{ fontSize: 22 }} />
            {liveWishlistCount > 0 && (
              <span className={styles.wishlistBadge}>{liveWishlistCount}</span>
            )}
          </Link>

          <Link href="/cart" className={styles.cartBtn} aria-label="Shopping Cart">
            <ShoppingBagOutlinedIcon style={{ fontSize: 22 }} />
            {liveCartCount > 0 && (
              <span className={styles.cartBadge}>{liveCartCount}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Interactive Search Overlay Bar with Live Instant Results */}
      {searchOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearchSubmit} className={styles.searchInputWrap}>
              <SearchIcon style={{ fontSize: 20 }} className={styles.searchIconInside} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type bracelet name, crystal (e.g. Sulemani, Pyrite), zodiac..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {isSearching && (
                <div style={{ position: 'absolute', right: 38, display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={16} style={{ color: '#560067' }} />
                </div>
              )}
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <CloseIcon style={{ fontSize: 16 }} />
                </button>
              )}
            </form>
            <button
              type="button"
              onClick={handleSearchSubmit}
              className={styles.searchSubmitBtn}
            >
              <span>View All</span>
              <ArrowForwardIcon style={{ fontSize: 16 }} />
            </button>
            <button
              type="button"
              className={styles.searchCloseBtn}
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              aria-label="Close search"
            >
              <CloseIcon style={{ fontSize: 20 }} />
            </button>
          </div>

          {/* Instant Matches Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className={styles.searchResultsBox}>
              <div className={styles.searchHeaderRow}>
                <span>Matching Sacred Bracelets</span>
                <span className={styles.searchCountText}>
                  {isSearching ? 'Searching...' : `${searchResults.length} results`}
                </span>
              </div>

              {isSearching ? (
                <div className={styles.searchStatusBox}>
                  <CircularProgress size={22} style={{ color: '#560067', marginBottom: 8 }} />
                  <p>Attuning search query with sacred catalog...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  {searchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      className={styles.searchItemLink}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className={styles.searchItemLeft}>
                        <div className={styles.searchThumbWrap}>
                          <img
                            src={prod.primaryImage || '/images/default-gem.jpg'}
                            alt={prod.name}
                            className={styles.searchThumb}
                          />
                        </div>
                        <div className={styles.searchItemDetails}>
                          <span className={styles.searchItemName}>{prod.name}</span>
                          <span className={styles.searchItemCategory}>Consecrated Energy Bracelet</span>
                        </div>
                      </div>
                      <div className={styles.searchItemRight}>
                        <span className={styles.searchItemPrice}>
                          {formatINR(prod.price || prod.rootPrice || 499)}
                        </span>
                        <ChevronRightIcon className={styles.searchArrow} />
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                    className={styles.searchViewAllBtn}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <span>View all matching results in Shop</span>
                    <ArrowForwardIcon style={{ fontSize: 15 }} />
                  </Link>
                </div>
              ) : (
                <div className={styles.searchStatusBox}>
                  <p>No consecrated bracelets matching &ldquo;<strong>{searchQuery}</strong>&rdquo;.</p>
                </div>
              )}
            </div>
          )}
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
              <span className={styles.drawerBrandSub}>{siteConfig.brand.subName}</span>
            </div>
          </div>
          <button 
            type="button" 
            className={styles.drawerCloseBtn}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <CloseIcon style={{ fontSize: 22 }} />
          </button>
        </div>

        {/* Drawer Scrollable Navigation Links */}
        <div className={styles.drawerBody}>
          {/* Mobile Search Input with live instant match */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!searchQuery.trim()) return;
              setMobileMenuOpen(false);
              router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            }}
            className={styles.drawerSearchForm}
          >
            <div className={styles.drawerSearchWrap}>
              <SearchIcon style={{ fontSize: 18 }} className={styles.drawerSearchIcon} />
              <input 
                type="text" 
                placeholder="Search sacred bracelets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.drawerSearchInput}
              />
              {isSearching && (
                <CircularProgress size={14} style={{ color: '#560067', marginRight: 8 }} />
              )}
            </div>

            {/* Mobile Instant Results Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className={styles.drawerResultsBox}>
                {searchResults.length > 0 ? (
                  searchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      className={styles.searchItemLink}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className={styles.searchItemLeft}>
                        <div className={styles.searchThumbWrap}>
                          <img
                            src={prod.primaryImage || '/images/default-gem.jpg'}
                            alt={prod.name}
                            className={styles.searchThumb}
                          />
                        </div>
                        <div className={styles.searchItemDetails}>
                          <span className={styles.searchItemName} style={{ fontSize: 13 }}>
                            {prod.name}
                          </span>
                          <span className={styles.searchItemPrice} style={{ fontSize: 12 }}>
                            {formatINR(prod.price || prod.rootPrice || 499)}
                          </span>
                        </div>
                      </div>
                      <ChevronRightIcon style={{ fontSize: 16, color: '#C084FC' }} />
                    </Link>
                  ))
                ) : !isSearching ? (
                  <div style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280' }}>
                    No bracelets found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : null}
              </div>
            )}
          </form>

          <nav className={styles.drawerNav}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`${styles.drawerNavLink} ${pathname === '/' ? styles.drawerNavActive : ''}`}>
              <span>Home</span>
              <ChevronRightIcon style={{ fontSize: 18 }} className={styles.drawerNavChevron} />
            </Link>
            <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className={`${styles.drawerNavLink} ${pathname.startsWith('/shop') ? styles.drawerNavActive : ''}`}>
              <span>Bracelets</span>
              <ChevronRightIcon style={{ fontSize: 18 }} className={styles.drawerNavChevron} />
            </Link>
            <Link href="/#categories" onClick={() => setMobileMenuOpen(false)} className={styles.drawerNavLink}>
              <span>Category</span>
              <ChevronRightIcon style={{ fontSize: 18 }} className={styles.drawerNavChevron} />
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={`${styles.drawerNavLink} ${pathname === '/about' ? styles.drawerNavActive : ''}`}>
              <span>About</span>
              <ChevronRightIcon style={{ fontSize: 18 }} className={styles.drawerNavChevron} />
            </Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className={`${styles.drawerNavLink} ${pathname.startsWith('/blog') ? styles.drawerNavActive : ''}`}>
              <span>Blogs</span>
              <ChevronRightIcon style={{ fontSize: 18 }} className={styles.drawerNavChevron} />
            </Link>
            <Link href="/#contact" onClick={() => setMobileMenuOpen(false)} className={styles.drawerNavLink}>
              <span>Contact</span>
              <ChevronRightIcon style={{ fontSize: 18 }} className={styles.drawerNavChevron} />
            </Link>
          </nav>

          {/* Divider Line */}
          <div className={styles.drawerDivider} />

          {/* Drawer Actions: Account, Cart, Wishlist */}
          <div className={styles.drawerActions}>
            <Link href="/account" onClick={() => setMobileMenuOpen(false)} className={styles.drawerActionBtn}>
              <PersonOutlineIcon style={{ fontSize: 22 }} />
              <span>My Account</span>
            </Link>
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className={styles.drawerActionBtn}>
              <FavoriteBorderIcon style={{ fontSize: 22 }} />
              <span>Wishlist</span>
              {liveWishlistCount > 0 && (
                <span className={styles.drawerActionBadge}>{liveWishlistCount}</span>
              )}
            </Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className={styles.drawerActionBtn}>
              <ShoppingBagOutlinedIcon style={{ fontSize: 22 }} />
              <span>Cart</span>
              {liveCartCount > 0 && (
                <span className={styles.drawerActionBadge}>{liveCartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
