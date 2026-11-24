-- =====================================================
-- BRACELET E-COMMERCE DATABASE
-- PostgreSQL / Neon Database Version 1.0.0
-- Currency: INR
-- Migration: 1.sql
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. ENUMS
-- =====================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CUSTOMER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
      'PENDING', 'CONFIRMED', 'PROCESSING',
      'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
      'PENDING', 'AUTHORIZED', 'PAID',
      'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('RAZORPAY', 'COD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE refund_status AS ENUM ('PENDING', 'PROCESSED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE stock_movement_type AS ENUM (
      'PURCHASE', 'SALE', 'RETURN',
      'ADJUSTMENT', 'CANCELLATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE otp_purpose AS ENUM (
      'PASSWORD_RESET', 'EMAIL_VERIFICATION', 'LOGIN_OTP'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(15) UNIQUE,

  password_hash TEXT NOT NULL,

  role user_role NOT NULL DEFAULT 'CUSTOMER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified_at TIMESTAMPTZ,

  -- Security & Password Management
  password_changed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================================================
-- 3. PASSWORD RESET & VERIFICATION OTPS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  purpose otp_purpose NOT NULL DEFAULT 'PASSWORD_RESET',
  
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,

  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_otps_lookup ON user_otps(email, purpose, is_used);
CREATE INDEX IF NOT EXISTS idx_user_otps_user ON user_otps(user_id);

-- =====================================================
-- 4. AUTH SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  token_hash TEXT NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth_sessions(token_hash);

-- =====================================================
-- 5. CUSTOMER ADDRESSES
-- =====================================================

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(15) NOT NULL,

  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  landmark TEXT,

  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,

  country VARCHAR(100) DEFAULT 'India',
  address_type VARCHAR(20) DEFAULT 'HOME',
  is_default BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- =====================================================
-- 6. CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT,

  image_file_id TEXT,
  image_url TEXT,

  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  seo_title VARCHAR(255),
  seo_description TEXT,
  canonical_url TEXT,

  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- =====================================================
-- 7. PRODUCTS (REHAS Vedic Astrology & Gemstones)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  name VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,
  sku VARCHAR(100) NOT NULL UNIQUE,

  short_description TEXT,
  description TEXT,

  brand VARCHAR(150) DEFAULT 'REHAS',

  material VARCHAR(100),
  color VARCHAR(100),
  bracelet_style VARCHAR(100),

  -- Spiritual, Crystal & Vedic Astrology attributes
  bead_size VARCHAR(50) DEFAULT '8mm',
  primary_crystal VARCHAR(100),
  associated_chakra VARCHAR(100),
  ruling_planet VARCHAR(100),
  zodiac_signs TEXT,
  mulank_number VARCHAR(20),
  energized_by TEXT DEFAULT 'Blessed & Energized by Vedic Rituals',

  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(12,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  cost_price NUMERIC(12,2) CHECK (cost_price IS NULL OR cost_price >= 0),

  gst_rate NUMERIC(5,2) DEFAULT 18.0,
  hsn_code VARCHAR(20) DEFAULT '71179090',

  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 5,

  status product_status DEFAULT 'ACTIVE',

  is_featured BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT FALSE,

  weight_grams NUMERIC(10,2) DEFAULT 25.0,
  dimensions JSONB DEFAULT '{"length": 18, "unit": "cm"}'::JSONB,

  -- SEO
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT[],
  canonical_url TEXT,
  indexable BOOLEAN DEFAULT TRUE,

  -- Open Graph
  og_title VARCHAR(255),
  og_description TEXT,
  og_image_file_id TEXT,
  og_image_url TEXT,

  -- Twitter / X
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image_url TEXT,

  rating NUMERIC(3,2) DEFAULT 4.9,
  review_count INTEGER DEFAULT 0,

  published_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- =====================================================
-- 8. PRODUCT IMAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  google_drive_file_id TEXT,
  google_drive_folder_id TEXT,

  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),

  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- =====================================================
-- 9. PRODUCT VARIANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  sku VARCHAR(100) NOT NULL UNIQUE,

  size VARCHAR(50),
  bead_size VARCHAR(50),
  color VARCHAR(100),
  material VARCHAR(100),

  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  price_adjust NUMERIC(12,2) DEFAULT 0,

  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- =====================================================
-- 10. CARTS
-- =====================================================

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  guest_token_hash TEXT UNIQUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (user_id IS NOT NULL OR guest_token_hash IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,

  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,

  quantity INTEGER NOT NULL CHECK (quantity > 0),
  wrist_size VARCHAR(50),
  energized BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- =====================================================
-- 11. WISHLIST
-- =====================================================

CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlists(user_id);

-- =====================================================
-- 12. COUPONS
-- =====================================================

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  code VARCHAR(50) NOT NULL UNIQUE,

  description TEXT,

  discount_type discount_type NOT NULL,
  discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),

  minimum_order_amount NUMERIC(12,2) DEFAULT 0,
  maximum_discount NUMERIC(12,2),

  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,

  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. ORDERS
-- =====================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_number VARCHAR(50) NOT NULL UNIQUE,

  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,

  -- Customer snapshot
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(15) NOT NULL,

  -- Shipping snapshot
  shipping_address JSONB NOT NULL,
  billing_address JSONB,

  subtotal NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  coupon_code VARCHAR(50),
  shipping_amount NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,

  total_amount NUMERIC(12,2) NOT NULL,

  currency VARCHAR(3) NOT NULL DEFAULT 'INR',

  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'PENDING',
  status order_status DEFAULT 'PENDING',

  razorpay_order_id VARCHAR(150),
  razorpay_payment_id VARCHAR(150),
  razorpay_signature VARCHAR(255),

  customer_note TEXT,

  shipping_provider VARCHAR(100) DEFAULT 'Shiprocket Express',
  shipping_order_id TEXT,
  tracking_number VARCHAR(150),
  tracking_url TEXT,

  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (subtotal >= 0),
  CHECK (discount_amount >= 0),
  CHECK (shipping_amount >= 0),
  CHECK (tax_amount >= 0),
  CHECK (total_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- =====================================================
-- 14. ORDER ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,

  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),

  variant_details JSONB DEFAULT '{}'::JSONB,

  image_url TEXT,

  quantity INTEGER NOT NULL CHECK (quantity > 0),

  unit_price NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_price NUMERIC(12,2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- =====================================================
-- 15. PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,

  provider VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY',

  razorpay_order_id VARCHAR(150),
  razorpay_payment_id VARCHAR(150) UNIQUE,

  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',

  status payment_status DEFAULT 'PENDING',

  payment_method_details JSONB DEFAULT '{}'::JSONB,

  signature_verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- =====================================================
-- 16. PAYMENT WEBHOOK EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  provider_event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(150) NOT NULL,

  payload JSONB NOT NULL,

  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 17. REFUNDS
-- =====================================================

CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,

  razorpay_refund_id VARCHAR(150) UNIQUE,

  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),

  status refund_status DEFAULT 'PENDING',

  reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 18. INVENTORY MOVEMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,

  movement_type stock_movement_type NOT NULL,

  quantity INTEGER NOT NULL,
  reference_id UUID,

  note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id);

-- =====================================================
-- 19. PRODUCT REVIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,

  author VARCHAR(150) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),

  title VARCHAR(255),
  comment TEXT NOT NULL,

  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- =====================================================
-- 20. BLOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,

  excerpt TEXT,
  content TEXT,

  featured_image_url TEXT,
  featured_image_file_id TEXT,

  author VARCHAR(150) DEFAULT 'Astro Acharya - REHAS',
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,

  seo_title VARCHAR(255),
  seo_description TEXT,
  canonical_url TEXT,

  og_title VARCHAR(255),
  og_description TEXT,
  og_image_url TEXT,

  status product_status DEFAULT 'ACTIVE',

  published_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);

-- =====================================================
-- 21. NEWSLETTER SUBSCRIBERS
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  email VARCHAR(255) NOT NULL UNIQUE,

  is_subscribed BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- =====================================================
-- 22. CONTACT MESSAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(15),

  subject VARCHAR(255),
  message TEXT NOT NULL,

  is_read BOOLEAN DEFAULT FALSE,
  replied_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 23. STORE & SHIPPING SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  setting_key VARCHAR(150) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipping_pincodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  pincode VARCHAR(6) NOT NULL UNIQUE,
  city VARCHAR(100),
  state VARCHAR(100),

  is_serviceable BOOLEAN DEFAULT TRUE,
  cod_available BOOLEAN DEFAULT TRUE,

  estimated_min_days INTEGER DEFAULT 2,
  estimated_max_days INTEGER DEFAULT 5,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- END OF DATABASE MIGRATION 1.sql
-- =====================================================
