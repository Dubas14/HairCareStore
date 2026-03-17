-- Migration: add new collections and globals
-- Run: docker exec -i beauty-postgres psql -U payload_user -d payload < scripts/migrate-new-collections.sql

CREATE TABLE IF NOT EXISTS promotions (
  id serial PRIMARY KEY,
  name varchar,
  code varchar,
  type varchar DEFAULT 'percentage',
  value numeric DEFAULT 0,
  min_order_amount numeric DEFAULT 0,
  max_uses integer DEFAULT 0,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamp with time zone,
  expires_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotion_usages (
  id serial PRIMARY KEY,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS promotion_usages_rels (
  id serial PRIMARY KEY,
  parent_id integer REFERENCES promotion_usages(id) ON DELETE CASCADE,
  path varchar,
  "order" integer,
  promotions_id integer,
  customers_id integer,
  orders_id integer
);

CREATE TABLE IF NOT EXISTS subscribers (
  id serial PRIMARY KEY,
  email varchar NOT NULL,
  status varchar DEFAULT 'pending',
  token varchar,
  subscribed_at timestamp with time zone,
  unsubscribed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automatic_discounts (
  id serial PRIMARY KEY,
  name varchar,
  type varchar DEFAULT 'percentage',
  value numeric DEFAULT 0,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at timestamp with time zone,
  expires_at timestamp with time zone,
  min_quantity integer DEFAULT 1,
  min_order_amount numeric DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS automatic_discounts_rels (
  id serial PRIMARY KEY,
  parent_id integer REFERENCES automatic_discounts(id) ON DELETE CASCADE,
  path varchar,
  "order" integer,
  products_id integer,
  categories_id integer,
  brands_id integer
);

CREATE TABLE IF NOT EXISTS product_bundles (
  id serial PRIMARY KEY,
  name varchar,
  discount_percent numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS product_bundles_rels (
  id serial PRIMARY KEY,
  parent_id integer REFERENCES product_bundles(id) ON DELETE CASCADE,
  path varchar,
  "order" integer,
  products_id integer
);

CREATE TABLE IF NOT EXISTS ingredients (
  id serial PRIMARY KEY,
  name varchar,
  slug varchar,
  description text,
  benefits text,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ingredients_rels (
  id serial PRIMARY KEY,
  parent_id integer REFERENCES ingredients(id) ON DELETE CASCADE,
  path varchar,
  "order" integer,
  media_id integer
);

CREATE TABLE IF NOT EXISTS email_settings (
  id serial PRIMARY KEY,
  order_confirmation_enabled boolean DEFAULT true,
  shipping_notification_enabled boolean DEFAULT true,
  welcome_email_enabled boolean DEFAULT true,
  abandoned_cart_enabled boolean DEFAULT false,
  abandoned_cart_delay_hours integer DEFAULT 24,
  review_request_enabled boolean DEFAULT false,
  review_request_delay_days integer DEFAULT 7,
  price_drop_enabled boolean DEFAULT false,
  back_in_stock_enabled boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_settings (
  id serial PRIMARY KEY,
  low_stock_threshold integer DEFAULT 5,
  out_of_stock_behavior varchar DEFAULT 'hide',
  track_inventory boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS promotions_id integer;
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS promotion_usages_id integer;
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS subscribers_id integer;
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS automatic_discounts_id integer;
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS product_bundles_id integer;
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS ingredients_id integer;

ALTER TABLE payload_preferences_rels ADD COLUMN IF NOT EXISTS customers_id integer;
