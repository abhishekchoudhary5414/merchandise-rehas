# REHAS Sacred Merchandise – Astrology & Healing Crystal Bracelets

A complete, production-ready, premium astrology and gemstone bracelet e-commerce platform crafted with Next.js App Router, TypeScript, Prisma ORM, and component-specific CSS Modules.

Designed specifically around the **REHAS brand identity** (`#560067`) and cosmic healing merchandise (Money Magnet, Pyrite, Hematite Mulank 9, Sulemani Hakik Rahu-Ketu Shanti, Rose Quartz, Navgrah, etc.).

---

## 🌟 Key Features

1. **Design System & CSS Modules (`#560067`)**
   - Strictly built using design tokens in [`src/app/globals.css`](src/app/globals.css) (`--primary: #560067; --secondary: #D8B878; --background: #F7F1E8;`).
   - Every component has its own dedicated `.module.css` file (`AnnouncementBar.module.css`, `Navbar.module.css`, `Hero.module.css`, `ProductCard.module.css`, etc.).

2. **Homepage Sections Built in Exact Order (A through Q)**
   - **A. Announcement Bar**: Promotional offer, free shipping over ₹999, coupon `REHAS10`.
   - **B. Navbar**: REHAS logo, navigation links, search, wishlist, account, cart count badge, mobile drawer.
   - **C. Hero Section**: High-resolution photography, headline *"Elegance Wrapped Around Your Wrist"*, trust badges.
   - **D. Shop by Category**: Circular category navigation with gold accents (Wealth, Navgrah, Evil Eye, Love, Numerology, Chakra).
   - **E. Featured Collections**: Visual editorial cards for high-intent remedies.
   - **F. Best Sellers**: Consecrated bracelets with discounts, ratings, and quick-add actions.
   - **G. About Our Brand**: The REHAS philosophy on sacred gemstones and Vedic integrity.
   - **H. New Arrivals**: Recently consecrated crystal arrivals fetched dynamically.
   - **I. Why Choose Us**: 6 spiritual and operational pillars (Lab-Certified, Vedic Mantras, Pan-India Shipping, etc.).
   - **J. Personalized Numerology Section**: Interactive birth root numbers (Mulank 1 through 9) discovery.
   - **K. Customer Testimonials**: Verified Indian devotee reviews and locations.
   - **L. Instagram Gallery**: Lifestyle sacred community feed.
   - **M. Blog Section**: Lunar cleansing guides and astrological wisdom.
   - **N. Newsletter**: Vedic transit alert subscription form.
   - **O. Contact Section**: Working inquiry form with server-side Zod validation and email alerts.
   - **P. Footer**: Complete brand links, legal, policies, GSTIN compliance, and trust badges.
   - **Q. WhatsApp Floating Button**: Fixed bottom-right chat button with prefilled astrology inquiry.

3. **Product Catalog & Astrology Attributes**
   - 12+ pre-seeded REHAS products with realistic imagery, Vedic planetary associations (`rulingPlanet`), root numbers (`mulankNumber`), chakras, and consecrated descriptions.
   - Wrist size options (`Small (6.5 in)`, `Medium (7.0 in)`, `Large (7.5 in)`).
   - Live 6-digit Indian PIN code delivery checker.

4. **Secure Server-Side Razorpay & COD**
   - Server-calculated totals (preventing client-side price tampering).
   - Cryptographic signature verification and webhook handlers with duplicate event guards.
   - Cash on Delivery (COD) toggle with configurable handling fees.

5. **Google Drive Storage & SMTP Email**
   - [`src/lib/google-drive.ts`](src/lib/google-drive.ts): Drive API v3 upload service with folder management and public link generation.
   - [`src/lib/email.ts`](src/lib/email.ts): Branded HTML email templates for order confirmation and contact inquiries.

6. **SEO & Technical Sitemaps**
   - Dynamic Product Metadata & Schema.org JSON-LD (`Product`, `BreadcrumbList`, `Organization`).
   - Dynamic XML sitemap at `/sitemap.xml` and Google Merchant Center RSS feed at `/api/feeds/google-merchant`.
   - Admin SEO Management Studio at `/admin/seo` with live Google SERP and WhatsApp preview cards.

---

## 🚀 Getting Started

### 1. Environment Setup
Copy the template and fill in your keys:
```bash
cp .env.example .env
```

### 2. Seed Database
```bash
npx prisma db push
npx tsx src/lib/seed-rehas.ts
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.
