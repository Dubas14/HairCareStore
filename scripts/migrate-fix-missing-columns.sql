-- Fix missing columns and tables on production

-- Orders: tracking columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number varchar;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url varchar;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_carrier varchar;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at timestamp with time zone;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code varchar;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_used integer DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_discount numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes text;

-- Carts: abandoned cart tracking
ALTER TABLE carts ADD COLUMN IF NOT EXISTS abandoned_emails_sent integer DEFAULT 0;
ALTER TABLE carts ADD COLUMN IF NOT EXISTS last_abandoned_email_at timestamp with time zone;

-- Products variants locales
CREATE TABLE IF NOT EXISTS products_variants_locales (
  id serial PRIMARY KEY,
  _parent_id integer,
  title varchar,
  _locale varchar NOT NULL
);

-- Products: new fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_on_sale boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_percent numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory_quantity integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS track_inventory boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS how_to_use text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS volume varchar;

-- Reviews: new fields
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_reply text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_reply_at timestamp with time zone;

-- Customers: new fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone varchar;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_level varchar DEFAULT 'bronze';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_spent numeric DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_orders integer DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_email_verified boolean DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verification_token varchar;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS google_id varchar;

-- Banners: new fields
ALTER TABLE banners ADD COLUMN IF NOT EXISTS link_url varchar;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS link_text varchar;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS secondary_link_url varchar;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS secondary_link_text varchar;

-- Subscribers: confirm token
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirmed_at timestamp with time zone;
