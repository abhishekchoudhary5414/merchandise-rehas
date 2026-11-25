import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import ShopMobileFilter from '@/components/shop/ShopMobileFilter';
import ShopProductCard from '@/components/shop/ShopProductCard';
import { 
  Sparkles, 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  ShieldCheck, 
  Truck, 
  Check, 
  SlidersHorizontal,
  RotateCcw,
  Tag,
  ArrowRight
} from 'lucide-react';
import styles from './ShopPage.module.css';

export const revalidate = 60; // 60s ISR

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    mulank?: string;
    search?: string;
    sort?: string;
    page?: string;
    priceRange?: string;
  }>;
}

// Fallback seed products if database is unreachable or fresh
const FALLBACK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Money Magnet Supreme Crystal Bracelet',
    slug: 'money-magnet-supreme-crystal-bracelet',
    description: 'Natural certified Pyrite, Green Aventurine, Golden Citrine and Tiger Eye for rapid wealth attraction and opportunity.',
    price: 1499,
    compareAtPrice: 2299,
    primaryImage: 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Peruvian Pyrite & Citrine',
    rulingPlanet: 'Mercury & Jupiter',
    rating: 4.9,
    reviewCount: 128,
    isBestSeller: true,
    mulankNumber: '5, 6, 8',
    categorySlug: 'wealth-abundance',
    inStock: true,
  },
  {
    id: 'prod-2',
    name: 'Raw Peruvian Golden Pyrite Fool’s Gold Kada',
    slug: 'raw-golden-pyrite-bracelet',
    description: 'High-grade natural Peruvian pyrite beads radiating magnetic abundance, shield against financial drain.',
    price: 1299,
    compareAtPrice: 1899,
    primaryImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Peruvian Pyrite',
    rulingPlanet: 'Sun & Mars',
    rating: 4.9,
    reviewCount: 94,
    isBestSeller: true,
    mulankNumber: '1, 9',
    categorySlug: 'wealth-abundance',
    inStock: true,
  },
  {
    id: 'prod-3',
    name: 'Navgrah 9 Planetary Balancing Kada with 5-Mukhi Rudraksha',
    slug: 'navgrah-9-planetary-balancing-rudraksha-bracelet',
    description: 'Authentic 9 Vedic astrological planetary gems hand-strung with consecrated Nepali 5-Mukhi Rudraksha.',
    price: 1899,
    compareAtPrice: 2799,
    primaryImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Navratna & 5-Mukhi Rudraksha',
    rulingPlanet: 'All 9 Grahas',
    rating: 5.0,
    reviewCount: 215,
    isBestSeller: true,
    mulankNumber: '1, 2, 3, 4, 5, 6, 7, 8, 9',
    categorySlug: 'planetary-navgrah',
    inStock: true,
  },
  {
    id: 'prod-4',
    name: 'Sulemani Hakik Triple Protection Nazar Shield',
    slug: 'sulemani-hakik-triple-protection-nazar-bracelet',
    description: 'Natural Sulemani Black Agate, Hematite, and Tiger Eye beads forming an impenetrable shield against evil eye.',
    price: 999,
    compareAtPrice: 1499,
    primaryImage: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Sulemani Hakik & Hematite',
    rulingPlanet: 'Rahu & Saturn',
    rating: 4.8,
    reviewCount: 167,
    isBestSeller: true,
    mulankNumber: '4, 8',
    categorySlug: 'evil-eye-nazar-suraksha',
    inStock: true,
  },
  {
    id: 'prod-5',
    name: 'Madagascar Rose Quartz & Morganite Love Harmony Bracelet',
    slug: 'madagascar-rose-quartz-love-harmony-bracelet',
    description: 'Sublime AAA-grade pastel Pink Rose Quartz invoking unconditional compassion, self-worth, and heart chakra alignment.',
    price: 1199,
    compareAtPrice: 1699,
    primaryImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Madagascar Rose Quartz',
    rulingPlanet: 'Venus (Shukra)',
    rating: 4.9,
    reviewCount: 88,
    isBestSeller: false,
    mulankNumber: '6',
    categorySlug: 'love-harmony-venus',
    inStock: true,
  },
  {
    id: 'prod-6',
    name: 'Brazilian Golden Citrine Merchant’s Wealth Bracelet',
    slug: 'brazilian-citrine-merchants-wealth-bracelet',
    description: 'Known as the Merchant’s Stone, natural heat-untreated Brazilian Citrine amplifies business cash flow and optimism.',
    price: 1399,
    compareAtPrice: 1999,
    primaryImage: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Brazilian Citrine',
    rulingPlanet: 'Jupiter (Guru)',
    rating: 4.8,
    reviewCount: 73,
    isBestSeller: true,
    mulankNumber: '3, 5',
    categorySlug: 'wealth-abundance',
    inStock: true,
  },
  {
    id: 'prod-7',
    name: '7 Chakra Lava Stone Energy Diffuser Kada',
    slug: '7-chakra-lava-stone-energy-diffuser-bracelet',
    description: 'Balances Muladhara to Sahasrara chakras with porous natural basalt lava beads for essential oil grounding.',
    price: 899,
    compareAtPrice: 1399,
    primaryImage: 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: '7 Chakra Gems & Basalt Lava',
    rulingPlanet: 'All 7 Chakras',
    rating: 4.7,
    reviewCount: 62,
    isBestSeller: false,
    mulankNumber: '7',
    categorySlug: 'chakra-awakening',
    inStock: true,
  },
  {
    id: 'prod-8',
    name: 'Deep Blue Lapis Lazuli Throat Chakra Articulation Kada',
    slug: 'lapis-lazuli-throat-chakra-bracelet',
    description: 'Golden pyrite-flecked royal blue Lapis Lazuli stone of truth, regal wisdom, and vocal commanding presence.',
    price: 1249,
    compareAtPrice: 1799,
    primaryImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Royal Lapis Lazuli',
    rulingPlanet: 'Saturn & Jupiter',
    rating: 4.9,
    reviewCount: 45,
    isBestSeller: false,
    mulankNumber: '3, 8',
    categorySlug: 'chakra-awakening',
    inStock: true,
  },
  {
    id: 'prod-9',
    name: 'Natural Amethyst Deep Intuition & Crown Chakra Bracelet',
    slug: 'amethyst-deep-intuition-bracelet',
    description: 'Calming violet crystalline vibration that relieves stress, quiets anxious mind chatter, and deepens sleep.',
    price: 1149,
    compareAtPrice: 1649,
    primaryImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Natural Amethyst',
    rulingPlanet: 'Saturn (Shani)',
    rating: 4.8,
    reviewCount: 57,
    isBestSeller: false,
    mulankNumber: '8',
    categorySlug: 'chakra-awakening',
    inStock: true,
  },
  {
    id: 'prod-10',
    name: 'Green Aventurine Opportunity & Growth Bracelet',
    slug: 'green-aventurine-opportunity-bracelet',
    description: 'The Stone of Opportunity. Associated with heart chakra renewal, good fortune in new business, and emotional vitality.',
    price: 999,
    compareAtPrice: 1499,
    primaryImage: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Green Aventurine',
    rulingPlanet: 'Mercury (Budha)',
    rating: 4.8,
    reviewCount: 81,
    isBestSeller: true,
    mulankNumber: '5',
    categorySlug: 'wealth-abundance',
    inStock: true,
  },
  {
    id: 'prod-11',
    name: 'Black Tourmaline Grounding & Psychic Protection Bracelet',
    slug: 'black-tourmaline-grounding-protection-bracelet',
    description: 'The premier electrostatic shielding stone. Neutralizes EMF frequencies and dissolves ill-wishes from competitors.',
    price: 1099,
    compareAtPrice: 1599,
    primaryImage: 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Natural Black Tourmaline',
    rulingPlanet: 'Saturn & Rahu',
    rating: 4.9,
    reviewCount: 112,
    isBestSeller: true,
    mulankNumber: '4, 8',
    categorySlug: 'evil-eye-nazar-suraksha',
    inStock: true,
  },
  {
    id: 'prod-12',
    name: 'Tiger Eye Solar Plexus Courage & Confidence Kada',
    slug: 'tiger-eye-solar-plexus-courage-bracelet',
    description: 'Silky golden-brown chatoyant gemstone radiating grounded courage, mental clarity, and warrior determination.',
    price: 999,
    compareAtPrice: 1399,
    primaryImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Golden Tiger Eye',
    rulingPlanet: 'Sun & Mars',
    rating: 4.8,
    reviewCount: 97,
    isBestSeller: false,
    mulankNumber: '1, 9',
    categorySlug: 'wealth-abundance',
    inStock: true,
  },
  {
    id: 'prod-13',
    name: 'Nepali 5-Mukhi Rudraksha with Pure Silver Caps Bracelet',
    slug: 'nepali-5-mukhi-rudraksha-pure-silver-caps',
    description: 'Consecrated authentic 5-Mukhi Rudraksha beads encased in 92.5 pure silver caps for spiritual invincibility and peace.',
    price: 2499,
    compareAtPrice: 3499,
    primaryImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: '5-Mukhi Nepali Rudraksha',
    rulingPlanet: 'Jupiter (Guru)',
    rating: 5.0,
    reviewCount: 142,
    isBestSeller: true,
    mulankNumber: '3',
    categorySlug: 'planetary-navgrah',
    inStock: true,
  },
  {
    id: 'prod-14',
    name: 'Sri Yantra Etched Golden Hematite Abundance Kada',
    slug: 'sri-yantra-etched-golden-hematite-bracelet',
    description: 'Energized with Maha Lakshmi Beej Mantras, featuring sacred geometry laser etched into heavy golden hematite.',
    price: 1599,
    compareAtPrice: 2499,
    primaryImage: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    primaryCrystal: 'Golden Hematite & Citrine',
    rulingPlanet: 'Venus & Sun',
    rating: 4.9,
    reviewCount: 68,
    isBestSeller: false,
    mulankNumber: '6, 1',
    categorySlug: 'wealth-abundance',
    inStock: true,
  }
];

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Wealth & Abundance', slug: 'wealth-abundance', count: 5 },
  { id: 'cat-2', name: 'Planetary & Navgrah', slug: 'planetary-navgrah', count: 3 },
  { id: 'cat-3', name: 'Evil Eye & Nazar Suraksha', slug: 'evil-eye-nazar-suraksha', count: 3 },
  { id: 'cat-4', name: 'Love, Harmony & Venus', slug: 'love-harmony-venus', count: 2 },
  { id: 'cat-5', name: 'Chakra Awakening', slug: 'chakra-awakening', count: 3 },
  { id: 'cat-6', name: 'Numerology & Mulank', slug: 'numerology-mulank', count: 4 },
];

export const metadata = {
  title: 'Buy Consecrated Crystal Bracelets Online | REHAS Sacred Merchandise',
  description: 'Shop energized gemstones, Pyrite money magnet bracelets, 5-Mukhi Rudraksha, and Nazar Suraksha kadas. Authentic Vedic consecration with free express shipping in India.',
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const category = params.category;
  const mulank = params.mulank;
  const search = params.search;
  const sort = params.sort || 'popular';
  const priceRange = params.priceRange;
  
  // Requirement: Exactly 10 products per page!
  const PAGE_SIZE = 10;
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1);

  let allProducts: any[] = [];
  let categories: any[] = DEFAULT_CATEGORIES;
  let totalCount = 0;

  try {
    const where: any = { inStock: true };

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (mulank) {
      where.mulankNumber = { contains: mulank };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { primaryCrystal: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (priceRange) {
      if (priceRange === 'under-1000') where.price = { lte: 1000 };
      else if (priceRange === '1000-1500') where.price = { gte: 1000, lte: 1500 };
      else if (priceRange === '1500-2000') where.price = { gte: 1500, lte: 2000 };
      else if (priceRange === 'above-2000') where.price = { gte: 2000 };
    }

    let orderBy: any = { isBestSeller: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [dbProducts, dbCount, dbCategories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { category: true },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany(),
    ]);

    if (dbProducts.length > 0) {
      allProducts = dbProducts.map((p) => ({
        ...p,
        categorySlug: p.category?.slug,
      }));
      totalCount = dbCount;
      if (dbCategories.length > 0) {
        categories = dbCategories;
      }
    } else if (dbCount === 0 && !category && !mulank && !search && !priceRange) {
      // Database empty, use fallback array with pagination
      totalCount = FALLBACK_PRODUCTS.length;
      const startIndex = (currentPage - 1) * PAGE_SIZE;
      allProducts = FALLBACK_PRODUCTS.slice(startIndex, startIndex + PAGE_SIZE);
    }
  } catch (err) {
    console.error('Error fetching products from DB, using fallback dataset:', err);
    // Filter fallback list in memory
    let filtered = [...FALLBACK_PRODUCTS];
    if (category) {
      filtered = filtered.filter((p) => p.categorySlug === category);
    }
    if (mulank) {
      filtered = filtered.filter((p) => p.mulankNumber?.includes(mulank));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => 
        p.name.toLowerCase().includes(q) || 
        p.primaryCrystal?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      );
    }
    if (priceRange) {
      if (priceRange === 'under-1000') filtered = filtered.filter((p) => p.price <= 1000);
      else if (priceRange === '1000-1500') filtered = filtered.filter((p) => p.price >= 1000 && p.price <= 1500);
      else if (priceRange === '1500-2000') filtered = filtered.filter((p) => p.price >= 1500 && p.price <= 2000);
      else if (priceRange === 'above-2000') filtered = filtered.filter((p) => p.price >= 2000);
    }

    if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    totalCount = filtered.length;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    allProducts = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);

  // Helper to build URL with preserved query parameters
  function buildShopUrl(overrides: Record<string, string | null>) {
    const q = new URLSearchParams();
    if (category) q.set('category', category);
    if (mulank) q.set('mulank', mulank);
    if (search) q.set('search', search);
    if (sort && sort !== 'popular') q.set('sort', sort);
    if (priceRange) q.set('priceRange', priceRange);
    if (currentPage > 1) q.set('page', currentPage.toString());

    Object.entries(overrides).forEach(([key, val]) => {
      if (val === null) {
        q.delete(key);
      } else {
        q.set(key, val);
      }
    });

    const queryString = q.toString();
    return queryString ? `/shop?${queryString}` : '/shop';
  }

  return (
    <div className={styles.pageWrapper}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Top Breadcrumb & Status */}
        <div className={styles.topMetaBar}>
          <div>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>/</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
              {category ? `Category: ${category.replace(/-/g, ' ')}` : 'Sacred Merchandise Collection'}
            </span>
            {search && <span style={{ marginLeft: '6px' }}>— Search: &quot;{search}&quot;</span>}
          </div>
        </div>

        {/* Amazon & Flipkart Inspired Banner */}
        <div className={styles.shopBanner}>
          <div className={styles.bannerSparkle} />
          <div className={styles.bannerContent}>
            <h1>
              <span>Sacred Crystal &amp; Rudraksha Bracelets</span>
              <span className={styles.bannerHighlight}>• {totalCount} Items</span>
            </h1>
            <p>
              Hand-selected natural AAA gemstones, silver-capped Nepali Rudrakshas, and Navgrah kadas consecrated 
              with 108 Vedic Beej Mantras in our Patna sanctum for prosperity, peace, and protection.
            </p>
          </div>
          <div className={styles.bannerBadges}>
            <div className={styles.bannerTrustPill}>
              <ShieldCheck size={14} color="#D8B878" />
              <span>Certified Natural Gems</span>
            </div>
            <div className={styles.bannerTrustPill}>
              <Sparkles size={14} color="#D8B878" />
              <span>Vedic Consecration</span>
            </div>
          </div>
        </div>

        {/* Main Amazon/Flipkart Layout: Sidebar + Product Catalog */}
        <div className={styles.shopLayout}>
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className={styles.filterSidebar}>
            <div className={styles.filterHeader}>
              <span className={styles.filterTitle}>
                <SlidersHorizontal size={16} /> Filters
              </span>
              {(category || mulank || search || priceRange) && (
                <Link href="/shop" className={styles.clearFiltersLink}>
                  Clear All
                </Link>
              )}
            </div>

            {/* Category Filter */}
            <div className={styles.filterBlock}>
              <h3 className={styles.filterBlockTitle}>
                <span>Sacred Intention / Category</span>
              </h3>
              <ul className={styles.filterList}>
                <li>
                  <Link
                    href={buildShopUrl({ category: null, page: '1' })}
                    className={`${styles.filterItemLink} ${!category ? styles.filterItemActive : ''}`}
                  >
                    <span>All Intentions</span>
                    <span>{totalCount}</span>
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={buildShopUrl({ category: c.slug, page: '1' })}
                      className={`${styles.filterItemLink} ${category === c.slug ? styles.filterItemActive : ''}`}
                    >
                      <span>{c.name}</span>
                      {category === c.slug && <Check size={14} />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter (Amazon/Flipkart Range Style) */}
            <div className={styles.filterBlock}>
              <h3 className={styles.filterBlockTitle}>
                <span>Price (₹ INR)</span>
              </h3>
              <ul className={styles.filterList}>
                <li>
                  <Link
                    href={buildShopUrl({ priceRange: null, page: '1' })}
                    className={`${styles.filterItemLink} ${!priceRange ? styles.filterItemActive : ''}`}
                  >
                    <span>Any Price</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={buildShopUrl({ priceRange: 'under-1000', page: '1' })}
                    className={`${styles.filterItemLink} ${priceRange === 'under-1000' ? styles.filterItemActive : ''}`}
                  >
                    <span>Under ₹1,000</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={buildShopUrl({ priceRange: '1000-1500', page: '1' })}
                    className={`${styles.filterItemLink} ${priceRange === '1000-1500' ? styles.filterItemActive : ''}`}
                  >
                    <span>₹1,000 - ₹1,500</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={buildShopUrl({ priceRange: '1500-2000', page: '1' })}
                    className={`${styles.filterItemLink} ${priceRange === '1500-2000' ? styles.filterItemActive : ''}`}
                  >
                    <span>₹1,500 - ₹2,000</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href={buildShopUrl({ priceRange: 'above-2000', page: '1' })}
                    className={`${styles.filterItemLink} ${priceRange === 'above-2000' ? styles.filterItemActive : ''}`}
                  >
                    <span>Over ₹2,000</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Vedic Consecration Note */}
            <div style={{ background: '#FAF5FC', borderRadius: '8px', padding: '14px', border: '1px solid rgba(86, 0, 103, 0.15)', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#560067', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                <Sparkles size={14} color="#D8B878" />
                <span>Patna Consecration Sanctum</span>
              </div>
              <p style={{ fontSize: '11.5px', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
                Every item includes an astrological certificate of Vedic consecration, energized specifically for your Kundli.
              </p>
            </div>
          </aside>

          {/* RIGHT CONTENT: TOOLBAR + PRODUCTS + PAGINATION */}
          <div className={styles.catalogContent}>
            
            {/* Top Toolbar */}
            <div className={styles.shopToolbar}>
              <div className={styles.resultCount}>
                Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalCount}</strong> consecrated items
              </div>

              <div className={styles.toolbarActions}>
                {/* Sort Option (Amazon/Flipkart Sort Bar) */}
                <div className={styles.sortSelectWrap}>
                  <span style={{ fontWeight: 600 }}>Sort By:</span>
                  <div className={styles.sortButtonsScroll}>
                    <Link
                      href={buildShopUrl({ sort: 'popular', page: '1' })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        textDecoration: 'none',
                        fontWeight: sort === 'popular' ? 700 : 500,
                        background: sort === 'popular' ? '#560067' : '#F3F4F6',
                        color: sort === 'popular' ? '#FFFFFF' : '#374151',
                        border: '1px solid',
                        borderColor: sort === 'popular' ? '#560067' : '#E5E7EB',
                        flexShrink: 0,
                      }}
                    >
                      Popularity
                    </Link>
                    <Link
                      href={buildShopUrl({ sort: 'price_asc', page: '1' })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        textDecoration: 'none',
                        fontWeight: sort === 'price_asc' ? 700 : 500,
                        background: sort === 'price_asc' ? '#560067' : '#F3F4F6',
                        color: sort === 'price_asc' ? '#FFFFFF' : '#374151',
                        border: '1px solid',
                        borderColor: sort === 'price_asc' ? '#560067' : '#E5E7EB',
                        flexShrink: 0,
                      }}
                    >
                      Price: Low to High
                    </Link>
                    <Link
                      href={buildShopUrl({ sort: 'price_desc', page: '1' })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        textDecoration: 'none',
                        fontWeight: sort === 'price_desc' ? 700 : 500,
                        background: sort === 'price_desc' ? '#560067' : '#F3F4F6',
                        color: sort === 'price_desc' ? '#FFFFFF' : '#374151',
                        border: '1px solid',
                        borderColor: sort === 'price_desc' ? '#560067' : '#E5E7EB',
                        flexShrink: 0,
                      }}
                    >
                      Price: High to Low
                    </Link>
                    <Link
                      href={buildShopUrl({ sort: 'rating', page: '1' })}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        textDecoration: 'none',
                        fontWeight: sort === 'rating' ? 700 : 500,
                        background: sort === 'rating' ? '#560067' : '#F3F4F6',
                        color: sort === 'rating' ? '#FFFFFF' : '#374151',
                        border: '1px solid',
                        borderColor: sort === 'rating' ? '#560067' : '#E5E7EB',
                        flexShrink: 0,
                      }}
                    >
                      Customer Rating
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Pill Bar */}
            {(category || mulank || search || priceRange) && (
              <div className={styles.activeFiltersBar}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>Active Filters:</span>
                {category && (
                  <Link href={buildShopUrl({ category: null, page: '1' })} className={styles.activeFilterBadge}>
                    <span>Category: {category}</span>
                    <span>×</span>
                  </Link>
                )}
                {mulank && (
                  <Link href={buildShopUrl({ mulank: null, page: '1' })} className={styles.activeFilterBadge}>
                    <span>Mulank: #{mulank}</span>
                    <span>×</span>
                  </Link>
                )}
                {priceRange && (
                  <Link href={buildShopUrl({ priceRange: null, page: '1' })} className={styles.activeFilterBadge}>
                    <span>Price: {priceRange}</span>
                    <span>×</span>
                  </Link>
                )}
                {search && (
                  <Link href={buildShopUrl({ search: null, page: '1' })} className={styles.activeFilterBadge}>
                    <span>Search: &quot;{search}&quot;</span>
                    <span>×</span>
                  </Link>
                )}
                <Link
                  href="/shop"
                  style={{ fontSize: '12px', color: '#DC2626', textDecoration: 'none', fontWeight: 600, marginLeft: '6px' }}
                >
                  Reset All
                </Link>
              </div>
            )}

            {/* Products Grid */}
            {allProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <Sparkles size={36} color="var(--primary)" style={{ opacity: 0.6 }} />
                <h3 className={styles.emptyStateTitle}>No Sacred Bracelets Found</h3>
                <p className={styles.emptyStateSub}>
                  We could not find any bracelets matching your active filters. Try adjusting your category or price range.
                </p>
                <Link href="/shop" className={styles.cardActionBtn} style={{ maxWidth: '200px', margin: '0 auto' }}>
                  <RotateCcw size={15} />
                  <span>Reset All Filters</span>
                </Link>
              </div>
            ) : (
              <div className={styles.productGrid}>
                {allProducts.map((p) => (
                  <ShopProductCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={p.price}
                    compareAtPrice={p.compareAtPrice}
                    primaryImage={p.primaryImage}
                    rating={p.rating}
                    reviewCount={p.reviewCount}
                    primaryCrystal={p.primaryCrystal}
                    rulingPlanet={p.rulingPlanet}
                    isBestSeller={p.isBestSeller}
                  />
                ))}
              </div>
            )}

            {/* ========================================================
               AMAZON & FLIPKART STYLE PAGINATION: 10 PER PAGE
               ======================================================== */}
            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                <div className={styles.paginationSummary}>
                  Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (10 products per page)
                </div>

                <div className={styles.paginationButtons}>
                  {/* Previous Button */}
                  {currentPage > 1 ? (
                    <Link
                      href={buildShopUrl({ page: (currentPage - 1).toString() })}
                      className={styles.pageNavBtn}
                    >
                      <ChevronLeft size={16} />
                      <span>Previous Page</span>
                    </Link>
                  ) : (
                    <span className={styles.pageNavBtnDisabled}>
                      <ChevronLeft size={16} />
                      <span>Previous Page</span>
                    </span>
                  )}

                  {/* Page Number Buttons */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={buildShopUrl({ page: pageNum.toString() })}
                      className={`${styles.pageBtn} ${pageNum === currentPage ? styles.pageBtnActive : ''}`}
                    >
                      {pageNum}
                    </Link>
                  ))}

                  {/* Next Page Option (as explicitly requested by user) */}
                  {currentPage < totalPages ? (
                    <Link
                      href={buildShopUrl({ page: (currentPage + 1).toString() })}
                      className={styles.pageNavBtn}
                      style={{
                        background: '#560067',
                        color: '#FFFFFF',
                        borderColor: '#560067',
                      }}
                    >
                      <span>Next Page</span>
                      <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <span className={styles.pageNavBtnDisabled}>
                      <span>Next Page</span>
                      <ChevronRight size={16} />
                    </span>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Mobile Right-Slide Filter Component with Bottom Trigger Button (Shop page only) */}
      <ShopMobileFilter
        categories={categories}
        totalCount={totalCount}
        currentCategory={category}
        currentMulank={mulank}
        currentPriceRange={priceRange}
        currentSort={sort}
        currentSearch={search}
      />

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
