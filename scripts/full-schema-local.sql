--
-- PostgreSQL database dump
--

\restrict K7BdirUJLGa5U5sS8lD95COxNQMCnM2IPDKeNHlyUdxPqavusocn92e9JdZ1hF5

-- Dumped from database version 15.16
-- Dumped by pg_dump version 15.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _locales; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public._locales AS ENUM (
    'uk',
    'en',
    'pl',
    'de',
    'ru'
);


--
-- Name: enum_automatic_discounts_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_automatic_discounts_type AS ENUM (
    'percentage',
    'fixed',
    'buyXgetY'
);


--
-- Name: enum_banners_media_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_banners_media_type AS ENUM (
    'image',
    'video'
);


--
-- Name: enum_banners_position; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_banners_position AS ENUM (
    'home',
    'category',
    'promo'
);


--
-- Name: enum_blog_posts_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_blog_posts_status AS ENUM (
    'draft',
    'published'
);


--
-- Name: enum_carts_currency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_carts_currency AS ENUM (
    'UAH',
    'EUR',
    'PLN',
    'USD'
);


--
-- Name: enum_carts_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_carts_status AS ENUM (
    'active',
    'completed',
    'abandoned'
);


--
-- Name: enum_customers_auth_provider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_customers_auth_provider AS ENUM (
    'local',
    'google'
);


--
-- Name: enum_ingredients_icon; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_ingredients_icon AS ENUM (
    'droplets',
    'sparkles',
    'shield',
    'leaf'
);


--
-- Name: enum_inventory_settings_out_of_stock_behavior; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_inventory_settings_out_of_stock_behavior AS ENUM (
    'hide',
    'show_unavailable'
);


--
-- Name: enum_loyalty_points_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_loyalty_points_level AS ENUM (
    'bronze',
    'silver',
    'gold'
);


--
-- Name: enum_loyalty_transactions_transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_loyalty_transactions_transaction_type AS ENUM (
    'earned',
    'spent',
    'expired',
    'welcome',
    'referral',
    'adjustment'
);


--
-- Name: enum_media_folder; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_media_folder AS ENUM (
    'products',
    'banners',
    'brands',
    'categories',
    'blog',
    'other'
);


--
-- Name: enum_orders_currency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_currency AS ENUM (
    'UAH',
    'EUR',
    'PLN',
    'USD'
);


--
-- Name: enum_orders_fulfillment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_fulfillment_status AS ENUM (
    'not_fulfilled',
    'shipped',
    'delivered'
);


--
-- Name: enum_orders_payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_payment_method AS ENUM (
    'cod',
    'stripe'
);


--
-- Name: enum_orders_payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_payment_status AS ENUM (
    'awaiting',
    'paid',
    'refunded'
);


--
-- Name: enum_orders_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_orders_status AS ENUM (
    'pending',
    'completed',
    'canceled',
    'requires_action',
    'archived'
);


--
-- Name: enum_product_bundles_discount_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_product_bundles_discount_type AS ENUM (
    'percentage',
    'fixed'
);


--
-- Name: enum_products_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_products_status AS ENUM (
    'draft',
    'active',
    'archived'
);


--
-- Name: enum_promotions_currency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_promotions_currency AS ENUM (
    'UAH',
    'EUR',
    'PLN',
    'USD'
);


--
-- Name: enum_promotions_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_promotions_type AS ENUM (
    'percentage',
    'fixed',
    'free_shipping'
);


--
-- Name: enum_shipping_config_zones_countries; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shipping_config_zones_countries AS ENUM (
    'UA',
    'PL',
    'DE',
    'FR',
    'IT',
    'ES',
    'CZ',
    'SK',
    'RO',
    'HU',
    'LT',
    'LV',
    'EE',
    'BG',
    'AT',
    'GB'
);


--
-- Name: enum_shipping_config_zones_methods_currency; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_shipping_config_zones_methods_currency AS ENUM (
    'UAH',
    'EUR',
    'PLN',
    'USD'
);


--
-- Name: enum_subscribers_locale; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_subscribers_locale AS ENUM (
    'uk',
    'en',
    'pl',
    'de',
    'ru'
);


--
-- Name: enum_subscribers_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_subscribers_source AS ENUM (
    'website',
    'checkout',
    'import'
);


--
-- Name: enum_subscribers_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_subscribers_status AS ENUM (
    'pending',
    'active',
    'unsubscribed'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'admin',
    'editor'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: automatic_discounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automatic_discounts (
    id integer NOT NULL,
    type public.enum_automatic_discounts_type NOT NULL,
    value numeric NOT NULL,
    conditions_min_items numeric,
    conditions_min_order_amount numeric,
    priority numeric DEFAULT 0,
    stackable boolean DEFAULT false,
    starts_at timestamp(3) with time zone NOT NULL,
    expires_at timestamp(3) with time zone NOT NULL,
    is_active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    conditions_buy_quantity numeric,
    conditions_get_quantity numeric,
    conditions_get_discount_percent numeric DEFAULT 100
);


--
-- Name: automatic_discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.automatic_discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: automatic_discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.automatic_discounts_id_seq OWNED BY public.automatic_discounts.id;


--
-- Name: automatic_discounts_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automatic_discounts_locales (
    title character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: automatic_discounts_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.automatic_discounts_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: automatic_discounts_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.automatic_discounts_locales_id_seq OWNED BY public.automatic_discounts_locales.id;


--
-- Name: automatic_discounts_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automatic_discounts_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    products_id integer,
    categories_id integer
);


--
-- Name: automatic_discounts_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.automatic_discounts_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: automatic_discounts_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.automatic_discounts_rels_id_seq OWNED BY public.automatic_discounts_rels.id;


--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id integer NOT NULL,
    image_id integer,
    link character varying,
    "position" public.enum_banners_position DEFAULT 'home'::public.enum_banners_position NOT NULL,
    "order" numeric DEFAULT 0,
    is_active boolean DEFAULT true,
    media_type public.enum_banners_media_type DEFAULT 'image'::public.enum_banners_media_type,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;


--
-- Name: banners_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners_locales (
    title character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: banners_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banners_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: banners_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banners_locales_id_seq OWNED BY public.banners_locales.id;


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    slug character varying NOT NULL,
    featured_image_id integer,
    author character varying,
    published_at timestamp(3) with time zone,
    status public.enum_blog_posts_status DEFAULT 'draft'::public.enum_blog_posts_status,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: blog_posts_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts_locales (
    title character varying NOT NULL,
    content jsonb,
    excerpt character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: blog_posts_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_posts_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: blog_posts_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_posts_locales_id_seq OWNED BY public.blog_posts_locales.id;


--
-- Name: blog_posts_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts_tags (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    tag character varying NOT NULL
);


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id integer NOT NULL,
    slug character varying NOT NULL,
    logo_id integer,
    banner_id integer,
    accent_color character varying DEFAULT '#8B5CF6'::character varying,
    country_of_origin character varying,
    founded_year numeric,
    website character varying,
    seo_meta_title character varying,
    seo_meta_description character varying,
    seo_og_image_id integer,
    "order" numeric DEFAULT 0,
    is_active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: brands_benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands_benefits (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    icon character varying DEFAULT '✨'::character varying NOT NULL
);


--
-- Name: brands_benefits_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands_benefits_locales (
    title character varying NOT NULL,
    description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: brands_benefits_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_benefits_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_benefits_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_benefits_locales_id_seq OWNED BY public.brands_benefits_locales.id;


--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: brands_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands_locales (
    name character varying NOT NULL,
    description jsonb,
    short_description character varying,
    history jsonb,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: brands_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_locales_id_seq OWNED BY public.brands_locales.id;


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id integer NOT NULL,
    customer_id integer,
    email character varying,
    shipping_address_first_name character varying,
    shipping_address_last_name character varying,
    shipping_address_phone character varying,
    shipping_address_city character varying,
    shipping_address_address1 character varying,
    shipping_address_country_code character varying DEFAULT 'ua'::character varying,
    shipping_address_postal_code character varying,
    billing_address_first_name character varying,
    billing_address_last_name character varying,
    billing_address_phone character varying,
    billing_address_city character varying,
    billing_address_address1 character varying,
    billing_address_country_code character varying DEFAULT 'ua'::character varying,
    billing_address_postal_code character varying,
    shipping_method character varying,
    shipping_total numeric DEFAULT 0,
    subtotal numeric DEFAULT 0,
    discount_total numeric DEFAULT 0,
    loyalty_points_used numeric DEFAULT 0,
    loyalty_discount numeric DEFAULT 0,
    total numeric DEFAULT 0,
    status public.enum_carts_status DEFAULT 'active'::public.enum_carts_status,
    completed_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    currency public.enum_carts_currency DEFAULT 'UAH'::public.enum_carts_currency,
    payment_method character varying,
    stripe_payment_intent_id character varying,
    stripe_client_secret character varying,
    promo_code character varying,
    promo_discount numeric DEFAULT 0,
    abandoned_emails_sent numeric DEFAULT 0,
    applied_discounts jsonb
);


--
-- Name: carts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: carts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;


--
-- Name: carts_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    product_id integer NOT NULL,
    variant_index numeric NOT NULL,
    variant_title character varying,
    quantity numeric DEFAULT 1 NOT NULL,
    unit_price numeric NOT NULL,
    product_title character varying,
    product_thumbnail character varying
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    slug character varying NOT NULL,
    banner_id integer,
    icon_id integer,
    accent_color character varying DEFAULT '#8B5CF6'::character varying,
    parent_category_id integer,
    promo_block_title character varying,
    promo_block_description character varying,
    promo_block_image_id integer,
    promo_block_link character varying,
    promo_block_button_text character varying,
    seo_og_image_id integer,
    "order" numeric DEFAULT 0,
    is_active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: categories_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories_locales (
    name character varying NOT NULL,
    description jsonb,
    short_description character varying,
    seo_meta_title character varying,
    seo_meta_description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: categories_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_locales_id_seq OWNED BY public.categories_locales.id;


--
-- Name: categories_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    categories_id integer
);


--
-- Name: categories_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_rels_id_seq OWNED BY public.categories_rels.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    phone character varying,
    metadata jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expiration timestamp(3) with time zone,
    salt character varying,
    hash character varying,
    login_attempts numeric DEFAULT 0,
    lock_until timestamp(3) with time zone,
    email_verified boolean DEFAULT false,
    email_verification_token character varying,
    email_verification_expires timestamp(3) with time zone,
    google_id character varying,
    auth_provider public.enum_customers_auth_provider DEFAULT 'local'::public.enum_customers_auth_provider
);


--
-- Name: customers_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers_addresses (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    phone character varying,
    city character varying NOT NULL,
    address1 character varying NOT NULL,
    country_code character varying DEFAULT 'ua'::character varying,
    postal_code character varying,
    is_default_shipping boolean DEFAULT false
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: customers_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    products_id integer
);


--
-- Name: customers_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_rels_id_seq OWNED BY public.customers_rels.id;


--
-- Name: customers_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers_sessions (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    created_at timestamp(3) with time zone,
    expires_at timestamp(3) with time zone NOT NULL
);


--
-- Name: email_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_settings (
    id integer NOT NULL,
    is_active boolean DEFAULT true,
    email_types_order_confirmation boolean DEFAULT true,
    email_types_welcome boolean DEFAULT true,
    email_types_shipping_notification boolean DEFAULT true,
    email_types_review_request boolean DEFAULT true,
    email_types_abandoned_cart boolean DEFAULT true,
    email_types_price_drop boolean DEFAULT true,
    email_types_back_in_stock boolean DEFAULT true,
    email_types_loyalty_level_up boolean DEFAULT true,
    email_types_newsletter_confirmation boolean DEFAULT true,
    abandoned_cart_config_first_email_hours numeric DEFAULT 1,
    abandoned_cart_config_second_email_hours numeric DEFAULT 24,
    abandoned_cart_config_third_email_hours numeric DEFAULT 72,
    stats_total_sent numeric DEFAULT 0,
    stats_last_sent_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: email_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_settings_id_seq OWNED BY public.email_settings.id;


--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredients (
    id integer NOT NULL,
    icon public.enum_ingredients_icon DEFAULT 'sparkles'::public.enum_ingredients_icon,
    "order" numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: ingredients_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredients_locales (
    name character varying NOT NULL,
    benefit character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: ingredients_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredients_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredients_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredients_locales_id_seq OWNED BY public.ingredients_locales.id;


--
-- Name: inventory_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_settings (
    id integer NOT NULL,
    low_stock_threshold numeric DEFAULT 5,
    out_of_stock_behavior public.enum_inventory_settings_out_of_stock_behavior DEFAULT 'show_unavailable'::public.enum_inventory_settings_out_of_stock_behavior,
    back_in_stock_notifications boolean DEFAULT false,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: inventory_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: inventory_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_settings_id_seq OWNED BY public.inventory_settings.id;


--
-- Name: loyalty_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_points (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    points_balance numeric DEFAULT 0,
    total_earned numeric DEFAULT 0,
    total_spent numeric DEFAULT 0,
    level public.enum_loyalty_points_level DEFAULT 'bronze'::public.enum_loyalty_points_level,
    referral_code character varying,
    referred_by character varying,
    is_enabled boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: loyalty_points_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loyalty_points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loyalty_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loyalty_points_id_seq OWNED BY public.loyalty_points.id;


--
-- Name: loyalty_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_settings (
    id integer NOT NULL,
    points_per_uah numeric DEFAULT 0.1,
    point_value numeric DEFAULT 1,
    max_spend_percentage numeric DEFAULT 0.3,
    welcome_bonus numeric DEFAULT 100,
    referral_bonus numeric DEFAULT 200,
    bronze_min numeric DEFAULT 0,
    bronze_multiplier numeric DEFAULT 1,
    silver_min numeric DEFAULT 1000,
    silver_multiplier numeric DEFAULT 1.05,
    gold_min numeric DEFAULT 5000,
    gold_multiplier numeric DEFAULT 1.1,
    is_active boolean DEFAULT true,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: loyalty_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loyalty_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loyalty_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loyalty_settings_id_seq OWNED BY public.loyalty_settings.id;


--
-- Name: loyalty_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_transactions (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    transaction_type public.enum_loyalty_transactions_transaction_type NOT NULL,
    points_amount numeric NOT NULL,
    order_id character varying,
    description character varying,
    balance_after numeric NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: loyalty_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loyalty_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loyalty_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loyalty_transactions_id_seq OWNED BY public.loyalty_transactions.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media (
    id integer NOT NULL,
    alt character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    url character varying,
    thumbnail_u_r_l character varying,
    filename character varying,
    mime_type character varying,
    filesize numeric,
    width numeric,
    height numeric,
    focal_x numeric,
    focal_y numeric,
    sizes_thumbnail_url character varying,
    sizes_thumbnail_width numeric,
    sizes_thumbnail_height numeric,
    sizes_thumbnail_mime_type character varying,
    sizes_thumbnail_filesize numeric,
    sizes_thumbnail_filename character varying,
    sizes_card_url character varying,
    sizes_card_width numeric,
    sizes_card_height numeric,
    sizes_card_mime_type character varying,
    sizes_card_filesize numeric,
    sizes_card_filename character varying,
    sizes_feature_url character varying,
    sizes_feature_width numeric,
    sizes_feature_height numeric,
    sizes_feature_mime_type character varying,
    sizes_feature_filesize numeric,
    sizes_feature_filename character varying,
    folder public.enum_media_folder
);


--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    display_id numeric,
    customer_id integer,
    email character varying NOT NULL,
    status public.enum_orders_status DEFAULT 'pending'::public.enum_orders_status,
    payment_status public.enum_orders_payment_status DEFAULT 'awaiting'::public.enum_orders_payment_status,
    fulfillment_status public.enum_orders_fulfillment_status DEFAULT 'not_fulfilled'::public.enum_orders_fulfillment_status,
    shipping_address_first_name character varying,
    shipping_address_last_name character varying,
    shipping_address_phone character varying,
    shipping_address_city character varying,
    shipping_address_address1 character varying,
    shipping_address_country_code character varying DEFAULT 'ua'::character varying,
    shipping_address_postal_code character varying,
    billing_address_first_name character varying,
    billing_address_last_name character varying,
    billing_address_phone character varying,
    billing_address_city character varying,
    billing_address_address1 character varying,
    billing_address_country_code character varying DEFAULT 'ua'::character varying,
    billing_address_postal_code character varying,
    payment_method public.enum_orders_payment_method DEFAULT 'cod'::public.enum_orders_payment_method,
    shipping_method character varying,
    subtotal numeric NOT NULL,
    shipping_total numeric DEFAULT 0,
    discount_total numeric DEFAULT 0,
    loyalty_points_used numeric DEFAULT 0,
    loyalty_discount numeric DEFAULT 0,
    total numeric NOT NULL,
    cart_id character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    currency public.enum_orders_currency DEFAULT 'UAH'::public.enum_orders_currency,
    stripe_payment_intent_id character varying,
    tracking_number character varying,
    promo_code character varying,
    promo_discount numeric DEFAULT 0
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: orders_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders_items (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    product_id numeric,
    product_title character varying NOT NULL,
    variant_title character varying,
    quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    subtotal numeric NOT NULL,
    thumbnail character varying
);


--
-- Name: pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages (
    id integer NOT NULL,
    slug character varying NOT NULL,
    featured_image_id integer,
    meta_title character varying,
    meta_description character varying,
    is_published boolean DEFAULT false,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pages_id_seq OWNED BY public.pages.id;


--
-- Name: pages_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pages_locales (
    title character varying NOT NULL,
    content jsonb,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: pages_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pages_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pages_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pages_locales_id_seq OWNED BY public.pages_locales.id;


--
-- Name: payload_kv; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_kv (
    id integer NOT NULL,
    key character varying NOT NULL,
    data jsonb NOT NULL
);


--
-- Name: payload_kv_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_kv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_kv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_kv_id_seq OWNED BY public.payload_kv.id;


--
-- Name: payload_locked_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_locked_documents (
    id integer NOT NULL,
    global_slug character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_locked_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_locked_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_locked_documents_id_seq OWNED BY public.payload_locked_documents.id;


--
-- Name: payload_locked_documents_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_locked_documents_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    media_id integer,
    users_id integer,
    banners_id integer,
    pages_id integer,
    promo_blocks_id integer,
    brands_id integer,
    categories_id integer,
    blog_posts_id integer,
    reviews_id integer,
    products_id integer,
    customers_id integer,
    carts_id integer,
    orders_id integer,
    loyalty_points_id integer,
    loyalty_transactions_id integer,
    promotions_id integer,
    promotion_usages_id integer,
    subscribers_id integer,
    automatic_discounts_id integer,
    product_bundles_id integer,
    ingredients_id integer
);


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_locked_documents_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_locked_documents_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_locked_documents_rels_id_seq OWNED BY public.payload_locked_documents_rels.id;


--
-- Name: payload_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_migrations (
    id integer NOT NULL,
    name character varying,
    batch numeric,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_migrations_id_seq OWNED BY public.payload_migrations.id;


--
-- Name: payload_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_preferences (
    id integer NOT NULL,
    key character varying,
    value jsonb,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_preferences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_preferences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_preferences_id_seq OWNED BY public.payload_preferences.id;


--
-- Name: payload_preferences_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payload_preferences_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    users_id integer,
    customers_id integer
);


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payload_preferences_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payload_preferences_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payload_preferences_rels_id_seq OWNED BY public.payload_preferences_rels.id;


--
-- Name: product_bundles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_bundles (
    id integer NOT NULL,
    discount_type public.enum_product_bundles_discount_type NOT NULL,
    discount_value numeric NOT NULL,
    is_active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_bundles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_bundles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_bundles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_bundles_id_seq OWNED BY public.product_bundles.id;


--
-- Name: product_bundles_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_bundles_locales (
    title character varying NOT NULL,
    description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: product_bundles_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_bundles_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_bundles_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_bundles_locales_id_seq OWNED BY public.product_bundles_locales.id;


--
-- Name: product_bundles_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_bundles_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    products_id integer
);


--
-- Name: product_bundles_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_bundles_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_bundles_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_bundles_rels_id_seq OWNED BY public.product_bundles_rels.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    handle character varying NOT NULL,
    thumbnail_id integer,
    brand_id integer,
    status public.enum_products_status DEFAULT 'draft'::public.enum_products_status,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    barcode character varying,
    average_rating numeric DEFAULT 0,
    review_count numeric DEFAULT 0,
    sales_count numeric DEFAULT 0
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: products_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_images (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    image_id integer NOT NULL
);


--
-- Name: products_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_locales (
    title character varying NOT NULL,
    subtitle character varying,
    description jsonb,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: products_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_locales_id_seq OWNED BY public.products_locales.id;


--
-- Name: products_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_options (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    title character varying NOT NULL
);


--
-- Name: products_options_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_options_values (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    value character varying NOT NULL
);


--
-- Name: products_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    categories_id integer,
    ingredients_id integer
);


--
-- Name: products_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_rels_id_seq OWNED BY public.products_rels.id;


--
-- Name: products_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_tags (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    tag character varying NOT NULL
);


--
-- Name: products_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_variants (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    sku character varying,
    price numeric NOT NULL,
    compare_at_price numeric,
    in_stock boolean DEFAULT true,
    inventory numeric DEFAULT 0,
    cost_price numeric,
    supplier_code character varying,
    article_code character varying
);


--
-- Name: products_variants_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products_variants_locales (
    title character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id character varying NOT NULL
);


--
-- Name: products_variants_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_variants_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_variants_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_variants_locales_id_seq OWNED BY public.products_variants_locales.id;


--
-- Name: promo_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promo_blocks (
    id integer NOT NULL,
    image_id integer,
    button_link character varying,
    background_color character varying DEFAULT '#1a1a1a'::character varying,
    is_active boolean DEFAULT true,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    expires_at timestamp(3) with time zone
);


--
-- Name: promo_blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.promo_blocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promo_blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.promo_blocks_id_seq OWNED BY public.promo_blocks.id;


--
-- Name: promo_blocks_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promo_blocks_locales (
    title character varying NOT NULL,
    description jsonb,
    button_text character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: promo_blocks_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.promo_blocks_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promo_blocks_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.promo_blocks_locales_id_seq OWNED BY public.promo_blocks_locales.id;


--
-- Name: promotion_usages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_usages (
    id integer NOT NULL,
    promotion_id integer NOT NULL,
    customer_id integer,
    email character varying NOT NULL,
    order_id numeric,
    discount_amount numeric NOT NULL,
    currency character varying DEFAULT 'UAH'::character varying,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: promotion_usages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.promotion_usages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promotion_usages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.promotion_usages_id_seq OWNED BY public.promotion_usages.id;


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions (
    id integer NOT NULL,
    code character varying NOT NULL,
    type public.enum_promotions_type NOT NULL,
    value numeric NOT NULL,
    currency public.enum_promotions_currency,
    conditions_min_order_amount numeric,
    conditions_max_discount_amount numeric,
    conditions_max_uses_total numeric,
    conditions_max_uses_per_customer numeric DEFAULT 1,
    starts_at timestamp(3) with time zone NOT NULL,
    expires_at timestamp(3) with time zone NOT NULL,
    is_active boolean DEFAULT true,
    usage_count numeric DEFAULT 0,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);


--
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.promotions_id_seq OWNED BY public.promotions.id;


--
-- Name: promotions_locales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions_locales (
    title character varying,
    description character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);


--
-- Name: promotions_locales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.promotions_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promotions_locales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.promotions_locales_id_seq OWNED BY public.promotions_locales.id;


--
-- Name: promotions_rels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    categories_id integer,
    brands_id integer,
    products_id integer
);


--
-- Name: promotions_rels_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.promotions_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promotions_rels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.promotions_rels_id_seq OWNED BY public.promotions_rels.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    customer_name character varying NOT NULL,
    rating numeric NOT NULL,
    text character varying NOT NULL,
    product_id integer,
    is_approved boolean DEFAULT false,
    published_at timestamp(3) with time zone,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    verified_purchase boolean DEFAULT false
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: reviews_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews_images (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    image_id integer NOT NULL
);


--
-- Name: shipping_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_config (
    id integer NOT NULL,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone,
    nova_poshta_sender_city_ref character varying,
    nova_poshta_sender_city_name character varying,
    nova_poshta_sender_warehouse_ref character varying,
    nova_poshta_sender_warehouse_name character varying,
    nova_poshta_sender_sender_phone character varying,
    default_parcel_weight numeric DEFAULT 0.5
);


--
-- Name: shipping_config_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipping_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_config_id_seq OWNED BY public.shipping_config.id;


--
-- Name: shipping_config_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_config_methods (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    method_id character varying NOT NULL,
    name character varying NOT NULL,
    price numeric NOT NULL,
    free_above numeric,
    is_active boolean DEFAULT true
);


--
-- Name: shipping_config_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_config_zones (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    name character varying NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: shipping_config_zones_countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_config_zones_countries (
    "order" integer NOT NULL,
    parent_id character varying NOT NULL,
    value public.enum_shipping_config_zones_countries,
    id integer NOT NULL
);


--
-- Name: shipping_config_zones_countries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shipping_config_zones_countries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shipping_config_zones_countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shipping_config_zones_countries_id_seq OWNED BY public.shipping_config_zones_countries.id;


--
-- Name: shipping_config_zones_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_config_zones_methods (
    _order integer NOT NULL,
    _parent_id character varying NOT NULL,
    id character varying NOT NULL,
    carrier character varying NOT NULL,
    name character varying NOT NULL,
    price numeric NOT NULL,
    currency public.enum_shipping_config_zones_methods_currency DEFAULT 'UAH'::public.enum_shipping_config_zones_methods_currency,
    free_above numeric,
    estimated_days numeric,
    is_active boolean DEFAULT true
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    contacts_phone character varying DEFAULT '+38 (067) 123-45-67'::character varying,
    contacts_phone_link character varying DEFAULT 'tel:+380671234567'::character varying,
    contacts_phone_schedule character varying DEFAULT 'Пн-Пт: 9:00 - 18:00'::character varying,
    contacts_email character varying DEFAULT 'hello@hairlab.ua'::character varying,
    contacts_email_description character varying DEFAULT 'Відповідаємо протягом 2 годин'::character varying,
    contacts_address character varying DEFAULT 'м. Київ, вул. Хрещатик, 1'::character varying,
    contacts_address_link character varying DEFAULT 'https://maps.google.com'::character varying,
    contacts_address_description character varying DEFAULT 'Шоурум працює з 10:00 до 20:00'::character varying,
    contacts_schedule character varying DEFAULT 'Щодня з 9:00 до 21:00'::character varying,
    contacts_schedule_description character varying DEFAULT 'Онлайн-підтримка 24/7'::character varying,
    social_instagram character varying DEFAULT 'https://instagram.com/hairlab.ua'::character varying,
    social_telegram character varying DEFAULT 'https://t.me/hairlab_ua'::character varying,
    social_facebook character varying DEFAULT 'https://facebook.com/hairlab.ua'::character varying,
    payment_security_text character varying DEFAULT 'Всі платежі захищені технологією 3D Secure. Ми не зберігаємо дані вашої картки — всі транзакції обробляються через сертифіковані платіжні системи з найвищим рівнем захисту PCI DSS.'::character varying,
    about_intro character varying DEFAULT 'HAIR LAB — це більше ніж магазин косметики для волосся. Це лабораторія краси, де наука зустрічається з турботою про себе.'::character varying,
    about_story character varying DEFAULT 'Ми заснували HAIR LAB з простою місією: зробити професійний догляд за волоссям доступним кожному. Наша команда трихологів та стилістів ретельно відбирає кожен продукт, тестує його та перевіряє ефективність інгредієнтів.'::character varying,
    updated_at timestamp(3) with time zone,
    created_at timestamp(3) with time zone
);


--
-- Name: site_settings_about_features; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings_about_features (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    title character varying NOT NULL,
    description character varying
);


--
-- Name: site_settings_about_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings_about_stats (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    value character varying NOT NULL,
    label character varying NOT NULL
);


--
-- Name: site_settings_delivery_faq; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings_delivery_faq (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    question character varying NOT NULL,
    answer character varying NOT NULL
);


--
-- Name: site_settings_delivery_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings_delivery_methods (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    title character varying NOT NULL,
    description character varying,
    is_highlight boolean DEFAULT false
);


--
-- Name: site_settings_delivery_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings_delivery_steps (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    title character varying NOT NULL,
    description character varying
);


--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: site_settings_payment_faq; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings_payment_faq (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    question character varying NOT NULL,
    answer character varying NOT NULL
);


--
-- Name: site_settings_payment_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings_payment_methods (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    title character varying NOT NULL,
    description character varying,
    is_highlight boolean DEFAULT false
);


--
-- Name: subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscribers (
    id integer NOT NULL,
    email character varying NOT NULL,
    first_name character varying,
    status public.enum_subscribers_status DEFAULT 'pending'::public.enum_subscribers_status,
    locale public.enum_subscribers_locale DEFAULT 'uk'::public.enum_subscribers_locale,
    source public.enum_subscribers_source DEFAULT 'website'::public.enum_subscribers_source,
    customer_id integer,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    confirm_token character varying
);


--
-- Name: subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.subscribers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.subscribers_id_seq OWNED BY public.subscribers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying,
    role public.enum_users_role DEFAULT 'editor'::public.enum_users_role,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    email character varying NOT NULL,
    reset_password_token character varying,
    reset_password_expiration timestamp(3) with time zone,
    salt character varying,
    hash character varying,
    login_attempts numeric DEFAULT 0,
    lock_until timestamp(3) with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_sessions (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    created_at timestamp(3) with time zone,
    expires_at timestamp(3) with time zone NOT NULL
);


--
-- Name: automatic_discounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatic_discounts ALTER COLUMN id SET DEFAULT nextval('public.automatic_discounts_id_seq'::regclass);


--
-- Name: automatic_discounts_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatic_discounts_locales ALTER COLUMN id SET DEFAULT nextval('public.automatic_discounts_locales_id_seq'::regclass);


--
-- Name: automatic_discounts_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatic_discounts_rels ALTER COLUMN id SET DEFAULT nextval('public.automatic_discounts_rels_id_seq'::regclass);


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- Name: banners_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners_locales ALTER COLUMN id SET DEFAULT nextval('public.banners_locales_id_seq'::regclass);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: blog_posts_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts_locales ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_locales_id_seq'::regclass);


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: brands_benefits_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands_benefits_locales ALTER COLUMN id SET DEFAULT nextval('public.brands_benefits_locales_id_seq'::regclass);


--
-- Name: brands_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands_locales ALTER COLUMN id SET DEFAULT nextval('public.brands_locales_id_seq'::regclass);


--
-- Name: carts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: categories_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_locales ALTER COLUMN id SET DEFAULT nextval('public.categories_locales_id_seq'::regclass);


--
-- Name: categories_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_rels ALTER COLUMN id SET DEFAULT nextval('public.categories_rels_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: customers_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers_rels ALTER COLUMN id SET DEFAULT nextval('public.customers_rels_id_seq'::regclass);


--
-- Name: email_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_settings ALTER COLUMN id SET DEFAULT nextval('public.email_settings_id_seq'::regclass);


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: ingredients_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients_locales ALTER COLUMN id SET DEFAULT nextval('public.ingredients_locales_id_seq'::regclass);


--
-- Name: inventory_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_settings ALTER COLUMN id SET DEFAULT nextval('public.inventory_settings_id_seq'::regclass);


--
-- Name: loyalty_points id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_points ALTER COLUMN id SET DEFAULT nextval('public.loyalty_points_id_seq'::regclass);


--
-- Name: loyalty_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_settings ALTER COLUMN id SET DEFAULT nextval('public.loyalty_settings_id_seq'::regclass);


--
-- Name: loyalty_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions ALTER COLUMN id SET DEFAULT nextval('public.loyalty_transactions_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages ALTER COLUMN id SET DEFAULT nextval('public.pages_id_seq'::regclass);


--
-- Name: pages_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_locales ALTER COLUMN id SET DEFAULT nextval('public.pages_locales_id_seq'::regclass);


--
-- Name: payload_kv id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_kv ALTER COLUMN id SET DEFAULT nextval('public.payload_kv_id_seq'::regclass);


--
-- Name: payload_locked_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_id_seq'::regclass);


--
-- Name: payload_locked_documents_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_locked_documents_rels_id_seq'::regclass);


--
-- Name: payload_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_migrations ALTER COLUMN id SET DEFAULT nextval('public.payload_migrations_id_seq'::regclass);


--
-- Name: payload_preferences id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_id_seq'::regclass);


--
-- Name: payload_preferences_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels ALTER COLUMN id SET DEFAULT nextval('public.payload_preferences_rels_id_seq'::regclass);


--
-- Name: product_bundles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bundles ALTER COLUMN id SET DEFAULT nextval('public.product_bundles_id_seq'::regclass);


--
-- Name: product_bundles_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bundles_locales ALTER COLUMN id SET DEFAULT nextval('public.product_bundles_locales_id_seq'::regclass);


--
-- Name: product_bundles_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bundles_rels ALTER COLUMN id SET DEFAULT nextval('public.product_bundles_rels_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: products_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_locales ALTER COLUMN id SET DEFAULT nextval('public.products_locales_id_seq'::regclass);


--
-- Name: products_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_rels ALTER COLUMN id SET DEFAULT nextval('public.products_rels_id_seq'::regclass);


--
-- Name: products_variants_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_variants_locales ALTER COLUMN id SET DEFAULT nextval('public.products_variants_locales_id_seq'::regclass);


--
-- Name: promo_blocks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_blocks ALTER COLUMN id SET DEFAULT nextval('public.promo_blocks_id_seq'::regclass);


--
-- Name: promo_blocks_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_blocks_locales ALTER COLUMN id SET DEFAULT nextval('public.promo_blocks_locales_id_seq'::regclass);


--
-- Name: promotion_usages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_usages ALTER COLUMN id SET DEFAULT nextval('public.promotion_usages_id_seq'::regclass);


--
-- Name: promotions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions ALTER COLUMN id SET DEFAULT nextval('public.promotions_id_seq'::regclass);


--
-- Name: promotions_locales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions_locales ALTER COLUMN id SET DEFAULT nextval('public.promotions_locales_id_seq'::regclass);


--
-- Name: promotions_rels id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions_rels ALTER COLUMN id SET DEFAULT nextval('public.promotions_rels_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: shipping_config id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config ALTER COLUMN id SET DEFAULT nextval('public.shipping_config_id_seq'::regclass);


--
-- Name: shipping_config_zones_countries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config_zones_countries ALTER COLUMN id SET DEFAULT nextval('public.shipping_config_zones_countries_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: subscribers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscribers ALTER COLUMN id SET DEFAULT nextval('public.subscribers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: automatic_discounts_locales automatic_discounts_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatic_discounts_locales
    ADD CONSTRAINT automatic_discounts_locales_pkey PRIMARY KEY (id);


--
-- Name: automatic_discounts automatic_discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatic_discounts
    ADD CONSTRAINT automatic_discounts_pkey PRIMARY KEY (id);


--
-- Name: automatic_discounts_rels automatic_discounts_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatic_discounts_rels
    ADD CONSTRAINT automatic_discounts_rels_pkey PRIMARY KEY (id);


--
-- Name: banners_locales banners_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners_locales
    ADD CONSTRAINT banners_locales_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_locales blog_posts_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts_locales
    ADD CONSTRAINT blog_posts_locales_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_tags blog_posts_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts_tags
    ADD CONSTRAINT blog_posts_tags_pkey PRIMARY KEY (id);


--
-- Name: brands_benefits_locales brands_benefits_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands_benefits_locales
    ADD CONSTRAINT brands_benefits_locales_pkey PRIMARY KEY (id);


--
-- Name: brands_benefits brands_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands_benefits
    ADD CONSTRAINT brands_benefits_pkey PRIMARY KEY (id);


--
-- Name: brands_locales brands_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands_locales
    ADD CONSTRAINT brands_locales_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: carts_items carts_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts_items
    ADD CONSTRAINT carts_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories_locales categories_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_locales
    ADD CONSTRAINT categories_locales_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories_rels categories_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_rels
    ADD CONSTRAINT categories_rels_pkey PRIMARY KEY (id);


--
-- Name: customers_addresses customers_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers_addresses
    ADD CONSTRAINT customers_addresses_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers_rels customers_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers_rels
    ADD CONSTRAINT customers_rels_pkey PRIMARY KEY (id);


--
-- Name: customers_sessions customers_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers_sessions
    ADD CONSTRAINT customers_sessions_pkey PRIMARY KEY (id);


--
-- Name: email_settings email_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_settings
    ADD CONSTRAINT email_settings_pkey PRIMARY KEY (id);


--
-- Name: ingredients_locales ingredients_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients_locales
    ADD CONSTRAINT ingredients_locales_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: inventory_settings inventory_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_settings
    ADD CONSTRAINT inventory_settings_pkey PRIMARY KEY (id);


--
-- Name: loyalty_points loyalty_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_pkey PRIMARY KEY (id);


--
-- Name: loyalty_settings loyalty_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_settings
    ADD CONSTRAINT loyalty_settings_pkey PRIMARY KEY (id);


--
-- Name: loyalty_transactions loyalty_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: orders_items orders_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders_items
    ADD CONSTRAINT orders_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pages_locales pages_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_locales
    ADD CONSTRAINT pages_locales_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: payload_kv payload_kv_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_kv
    ADD CONSTRAINT payload_kv_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents payload_locked_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents
    ADD CONSTRAINT payload_locked_documents_pkey PRIMARY KEY (id);


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pkey PRIMARY KEY (id);


--
-- Name: payload_migrations payload_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_migrations
    ADD CONSTRAINT payload_migrations_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences payload_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences
    ADD CONSTRAINT payload_preferences_pkey PRIMARY KEY (id);


--
-- Name: payload_preferences_rels payload_preferences_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_pkey PRIMARY KEY (id);


--
-- Name: product_bundles_locales product_bundles_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bundles_locales
    ADD CONSTRAINT product_bundles_locales_pkey PRIMARY KEY (id);


--
-- Name: product_bundles product_bundles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bundles
    ADD CONSTRAINT product_bundles_pkey PRIMARY KEY (id);


--
-- Name: product_bundles_rels product_bundles_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bundles_rels
    ADD CONSTRAINT product_bundles_rels_pkey PRIMARY KEY (id);


--
-- Name: products_images products_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_images
    ADD CONSTRAINT products_images_pkey PRIMARY KEY (id);


--
-- Name: products_locales products_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_locales
    ADD CONSTRAINT products_locales_pkey PRIMARY KEY (id);


--
-- Name: products_options products_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_options
    ADD CONSTRAINT products_options_pkey PRIMARY KEY (id);


--
-- Name: products_options_values products_options_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_options_values
    ADD CONSTRAINT products_options_values_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products_rels products_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_rels
    ADD CONSTRAINT products_rels_pkey PRIMARY KEY (id);


--
-- Name: products_tags products_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_tags
    ADD CONSTRAINT products_tags_pkey PRIMARY KEY (id);


--
-- Name: products_variants_locales products_variants_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_variants_locales
    ADD CONSTRAINT products_variants_locales_pkey PRIMARY KEY (id);


--
-- Name: products_variants products_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_variants
    ADD CONSTRAINT products_variants_pkey PRIMARY KEY (id);


--
-- Name: promo_blocks_locales promo_blocks_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_blocks_locales
    ADD CONSTRAINT promo_blocks_locales_pkey PRIMARY KEY (id);


--
-- Name: promo_blocks promo_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_blocks
    ADD CONSTRAINT promo_blocks_pkey PRIMARY KEY (id);


--
-- Name: promotion_usages promotion_usages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_usages
    ADD CONSTRAINT promotion_usages_pkey PRIMARY KEY (id);


--
-- Name: promotions_locales promotions_locales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions_locales
    ADD CONSTRAINT promotions_locales_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: promotions_rels promotions_rels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions_rels
    ADD CONSTRAINT promotions_rels_pkey PRIMARY KEY (id);


--
-- Name: reviews_images reviews_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews_images
    ADD CONSTRAINT reviews_images_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: shipping_config_methods shipping_config_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config_methods
    ADD CONSTRAINT shipping_config_methods_pkey PRIMARY KEY (id);


--
-- Name: shipping_config shipping_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config
    ADD CONSTRAINT shipping_config_pkey PRIMARY KEY (id);


--
-- Name: shipping_config_zones_countries shipping_config_zones_countries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config_zones_countries
    ADD CONSTRAINT shipping_config_zones_countries_pkey PRIMARY KEY (id);


--
-- Name: shipping_config_zones_methods shipping_config_zones_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config_zones_methods
    ADD CONSTRAINT shipping_config_zones_methods_pkey PRIMARY KEY (id);


--
-- Name: shipping_config_zones shipping_config_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config_zones
    ADD CONSTRAINT shipping_config_zones_pkey PRIMARY KEY (id);


--
-- Name: site_settings_about_features site_settings_about_features_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_about_features
    ADD CONSTRAINT site_settings_about_features_pkey PRIMARY KEY (id);


--
-- Name: site_settings_about_stats site_settings_about_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_about_stats
    ADD CONSTRAINT site_settings_about_stats_pkey PRIMARY KEY (id);


--
-- Name: site_settings_delivery_faq site_settings_delivery_faq_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_delivery_faq
    ADD CONSTRAINT site_settings_delivery_faq_pkey PRIMARY KEY (id);


--
-- Name: site_settings_delivery_methods site_settings_delivery_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_delivery_methods
    ADD CONSTRAINT site_settings_delivery_methods_pkey PRIMARY KEY (id);


--
-- Name: site_settings_delivery_steps site_settings_delivery_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_delivery_steps
    ADD CONSTRAINT site_settings_delivery_steps_pkey PRIMARY KEY (id);


--
-- Name: site_settings_payment_faq site_settings_payment_faq_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_payment_faq
    ADD CONSTRAINT site_settings_payment_faq_pkey PRIMARY KEY (id);


--
-- Name: site_settings_payment_methods site_settings_payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_payment_methods
    ADD CONSTRAINT site_settings_payment_methods_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: subscribers subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_sessions users_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_pkey PRIMARY KEY (id);


--
-- Name: automatic_discounts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX automatic_discounts_created_at_idx ON public.automatic_discounts USING btree (created_at);


--
-- Name: automatic_discounts_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX automatic_discounts_locales_locale_parent_id_unique ON public.automatic_discounts_locales USING btree (_locale, _parent_id);


--
-- Name: automatic_discounts_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX automatic_discounts_rels_categories_id_idx ON public.automatic_discounts_rels USING btree (categories_id);


--
-- Name: automatic_discounts_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX automatic_discounts_rels_order_idx ON public.automatic_discounts_rels USING btree ("order");


--
-- Name: automatic_discounts_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX automatic_discounts_rels_parent_idx ON public.automatic_discounts_rels USING btree (parent_id);


--
-- Name: automatic_discounts_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX automatic_discounts_rels_path_idx ON public.automatic_discounts_rels USING btree (path);


--
-- Name: automatic_discounts_rels_products_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX automatic_discounts_rels_products_id_idx ON public.automatic_discounts_rels USING btree (products_id);


--
-- Name: automatic_discounts_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX automatic_discounts_updated_at_idx ON public.automatic_discounts USING btree (updated_at);


--
-- Name: banners_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX banners_created_at_idx ON public.banners USING btree (created_at);


--
-- Name: banners_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX banners_image_idx ON public.banners USING btree (image_id);


--
-- Name: banners_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX banners_locales_locale_parent_id_unique ON public.banners_locales USING btree (_locale, _parent_id);


--
-- Name: banners_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX banners_updated_at_idx ON public.banners USING btree (updated_at);


--
-- Name: blog_posts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_created_at_idx ON public.blog_posts USING btree (created_at);


--
-- Name: blog_posts_featured_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_featured_image_idx ON public.blog_posts USING btree (featured_image_id);


--
-- Name: blog_posts_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blog_posts_locales_locale_parent_id_unique ON public.blog_posts_locales USING btree (_locale, _parent_id);


--
-- Name: blog_posts_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blog_posts_slug_idx ON public.blog_posts USING btree (slug);


--
-- Name: blog_posts_tags_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_tags_order_idx ON public.blog_posts_tags USING btree (_order);


--
-- Name: blog_posts_tags_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_tags_parent_id_idx ON public.blog_posts_tags USING btree (_parent_id);


--
-- Name: blog_posts_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_updated_at_idx ON public.blog_posts USING btree (updated_at);


--
-- Name: brands_banner_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brands_banner_idx ON public.brands USING btree (banner_id);


--
-- Name: brands_benefits_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX brands_benefits_locales_locale_parent_id_unique ON public.brands_benefits_locales USING btree (_locale, _parent_id);


--
-- Name: brands_benefits_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brands_benefits_order_idx ON public.brands_benefits USING btree (_order);


--
-- Name: brands_benefits_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brands_benefits_parent_id_idx ON public.brands_benefits USING btree (_parent_id);


--
-- Name: brands_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brands_created_at_idx ON public.brands USING btree (created_at);


--
-- Name: brands_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX brands_locales_locale_parent_id_unique ON public.brands_locales USING btree (_locale, _parent_id);


--
-- Name: brands_logo_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brands_logo_idx ON public.brands USING btree (logo_id);


--
-- Name: brands_seo_seo_og_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brands_seo_seo_og_image_idx ON public.brands USING btree (seo_og_image_id);


--
-- Name: brands_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX brands_slug_idx ON public.brands USING btree (slug);


--
-- Name: brands_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX brands_updated_at_idx ON public.brands USING btree (updated_at);


--
-- Name: carts_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_created_at_idx ON public.carts USING btree (created_at);


--
-- Name: carts_customer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_customer_idx ON public.carts USING btree (customer_id);


--
-- Name: carts_items_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_items_order_idx ON public.carts_items USING btree (_order);


--
-- Name: carts_items_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_items_parent_id_idx ON public.carts_items USING btree (_parent_id);


--
-- Name: carts_items_product_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_items_product_idx ON public.carts_items USING btree (product_id);


--
-- Name: carts_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_updated_at_idx ON public.carts USING btree (updated_at);


--
-- Name: categories_banner_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_banner_idx ON public.categories USING btree (banner_id);


--
-- Name: categories_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_created_at_idx ON public.categories USING btree (created_at);


--
-- Name: categories_icon_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_icon_idx ON public.categories USING btree (icon_id);


--
-- Name: categories_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_locales_locale_parent_id_unique ON public.categories_locales USING btree (_locale, _parent_id);


--
-- Name: categories_parent_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_parent_category_idx ON public.categories USING btree (parent_category_id);


--
-- Name: categories_promo_block_promo_block_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_promo_block_promo_block_image_idx ON public.categories USING btree (promo_block_image_id);


--
-- Name: categories_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_rels_categories_id_idx ON public.categories_rels USING btree (categories_id);


--
-- Name: categories_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_rels_order_idx ON public.categories_rels USING btree ("order");


--
-- Name: categories_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_rels_parent_idx ON public.categories_rels USING btree (parent_id);


--
-- Name: categories_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_rels_path_idx ON public.categories_rels USING btree (path);


--
-- Name: categories_seo_seo_og_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_seo_seo_og_image_idx ON public.categories USING btree (seo_og_image_id);


--
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- Name: categories_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_updated_at_idx ON public.categories USING btree (updated_at);


--
-- Name: customers_addresses_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_addresses_order_idx ON public.customers_addresses USING btree (_order);


--
-- Name: customers_addresses_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_addresses_parent_id_idx ON public.customers_addresses USING btree (_parent_id);


--
-- Name: customers_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_created_at_idx ON public.customers USING btree (created_at);


--
-- Name: customers_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_email_idx ON public.customers USING btree (email);


--
-- Name: customers_google_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_google_id_idx ON public.customers USING btree (google_id);


--
-- Name: customers_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_rels_order_idx ON public.customers_rels USING btree ("order");


--
-- Name: customers_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_rels_parent_idx ON public.customers_rels USING btree (parent_id);


--
-- Name: customers_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_rels_path_idx ON public.customers_rels USING btree (path);


--
-- Name: customers_rels_products_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_rels_products_id_idx ON public.customers_rels USING btree (products_id);


--
-- Name: customers_sessions_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_sessions_order_idx ON public.customers_sessions USING btree (_order);


--
-- Name: customers_sessions_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_sessions_parent_id_idx ON public.customers_sessions USING btree (_parent_id);


--
-- Name: customers_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_updated_at_idx ON public.customers USING btree (updated_at);


--
-- Name: ingredients_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ingredients_created_at_idx ON public.ingredients USING btree (created_at);


--
-- Name: ingredients_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ingredients_locales_locale_parent_id_unique ON public.ingredients_locales USING btree (_locale, _parent_id);


--
-- Name: ingredients_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ingredients_updated_at_idx ON public.ingredients USING btree (updated_at);


--
-- Name: loyalty_points_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loyalty_points_created_at_idx ON public.loyalty_points USING btree (created_at);


--
-- Name: loyalty_points_customer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX loyalty_points_customer_idx ON public.loyalty_points USING btree (customer_id);


--
-- Name: loyalty_points_referral_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX loyalty_points_referral_code_idx ON public.loyalty_points USING btree (referral_code);


--
-- Name: loyalty_points_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loyalty_points_updated_at_idx ON public.loyalty_points USING btree (updated_at);


--
-- Name: loyalty_transactions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loyalty_transactions_created_at_idx ON public.loyalty_transactions USING btree (created_at);


--
-- Name: loyalty_transactions_customer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loyalty_transactions_customer_idx ON public.loyalty_transactions USING btree (customer_id);


--
-- Name: loyalty_transactions_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX loyalty_transactions_updated_at_idx ON public.loyalty_transactions USING btree (updated_at);


--
-- Name: media_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_created_at_idx ON public.media USING btree (created_at);


--
-- Name: media_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX media_filename_idx ON public.media USING btree (filename);


--
-- Name: media_sizes_card_sizes_card_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_card_sizes_card_filename_idx ON public.media USING btree (sizes_card_filename);


--
-- Name: media_sizes_feature_sizes_feature_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_feature_sizes_feature_filename_idx ON public.media USING btree (sizes_feature_filename);


--
-- Name: media_sizes_thumbnail_sizes_thumbnail_filename_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_sizes_thumbnail_sizes_thumbnail_filename_idx ON public.media USING btree (sizes_thumbnail_filename);


--
-- Name: media_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_updated_at_idx ON public.media USING btree (updated_at);


--
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at);


--
-- Name: orders_customer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_customer_idx ON public.orders USING btree (customer_id);


--
-- Name: orders_items_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_items_order_idx ON public.orders_items USING btree (_order);


--
-- Name: orders_items_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_items_parent_id_idx ON public.orders_items USING btree (_parent_id);


--
-- Name: orders_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_updated_at_idx ON public.orders USING btree (updated_at);


--
-- Name: pages_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_created_at_idx ON public.pages USING btree (created_at);


--
-- Name: pages_featured_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_featured_image_idx ON public.pages USING btree (featured_image_id);


--
-- Name: pages_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pages_locales_locale_parent_id_unique ON public.pages_locales USING btree (_locale, _parent_id);


--
-- Name: pages_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pages_slug_idx ON public.pages USING btree (slug);


--
-- Name: pages_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pages_updated_at_idx ON public.pages USING btree (updated_at);


--
-- Name: payload_kv_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX payload_kv_key_idx ON public.payload_kv USING btree (key);


--
-- Name: payload_locked_documents_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_created_at_idx ON public.payload_locked_documents USING btree (created_at);


--
-- Name: payload_locked_documents_global_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_global_slug_idx ON public.payload_locked_documents USING btree (global_slug);


--
-- Name: payload_locked_documents_rels_automatic_discounts_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_automatic_discounts_id_idx ON public.payload_locked_documents_rels USING btree (automatic_discounts_id);


--
-- Name: payload_locked_documents_rels_banners_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_banners_id_idx ON public.payload_locked_documents_rels USING btree (banners_id);


--
-- Name: payload_locked_documents_rels_blog_posts_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_blog_posts_id_idx ON public.payload_locked_documents_rels USING btree (blog_posts_id);


--
-- Name: payload_locked_documents_rels_brands_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_brands_id_idx ON public.payload_locked_documents_rels USING btree (brands_id);


--
-- Name: payload_locked_documents_rels_carts_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_carts_id_idx ON public.payload_locked_documents_rels USING btree (carts_id);


--
-- Name: payload_locked_documents_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_categories_id_idx ON public.payload_locked_documents_rels USING btree (categories_id);


--
-- Name: payload_locked_documents_rels_customers_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_customers_id_idx ON public.payload_locked_documents_rels USING btree (customers_id);


--
-- Name: payload_locked_documents_rels_ingredients_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_ingredients_id_idx ON public.payload_locked_documents_rels USING btree (ingredients_id);


--
-- Name: payload_locked_documents_rels_loyalty_points_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_loyalty_points_id_idx ON public.payload_locked_documents_rels USING btree (loyalty_points_id);


--
-- Name: payload_locked_documents_rels_loyalty_transactions_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_loyalty_transactions_id_idx ON public.payload_locked_documents_rels USING btree (loyalty_transactions_id);


--
-- Name: payload_locked_documents_rels_media_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_media_id_idx ON public.payload_locked_documents_rels USING btree (media_id);


--
-- Name: payload_locked_documents_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_order_idx ON public.payload_locked_documents_rels USING btree ("order");


--
-- Name: payload_locked_documents_rels_orders_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_orders_id_idx ON public.payload_locked_documents_rels USING btree (orders_id);


--
-- Name: payload_locked_documents_rels_pages_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_pages_id_idx ON public.payload_locked_documents_rels USING btree (pages_id);


--
-- Name: payload_locked_documents_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_parent_idx ON public.payload_locked_documents_rels USING btree (parent_id);


--
-- Name: payload_locked_documents_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_path_idx ON public.payload_locked_documents_rels USING btree (path);


--
-- Name: payload_locked_documents_rels_product_bundles_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_product_bundles_id_idx ON public.payload_locked_documents_rels USING btree (product_bundles_id);


--
-- Name: payload_locked_documents_rels_products_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_products_id_idx ON public.payload_locked_documents_rels USING btree (products_id);


--
-- Name: payload_locked_documents_rels_promo_blocks_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_promo_blocks_id_idx ON public.payload_locked_documents_rels USING btree (promo_blocks_id);


--
-- Name: payload_locked_documents_rels_promotion_usages_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_promotion_usages_id_idx ON public.payload_locked_documents_rels USING btree (promotion_usages_id);


--
-- Name: payload_locked_documents_rels_promotions_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_promotions_id_idx ON public.payload_locked_documents_rels USING btree (promotions_id);


--
-- Name: payload_locked_documents_rels_reviews_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_reviews_id_idx ON public.payload_locked_documents_rels USING btree (reviews_id);


--
-- Name: payload_locked_documents_rels_subscribers_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_subscribers_id_idx ON public.payload_locked_documents_rels USING btree (subscribers_id);


--
-- Name: payload_locked_documents_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_rels_users_id_idx ON public.payload_locked_documents_rels USING btree (users_id);


--
-- Name: payload_locked_documents_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_locked_documents_updated_at_idx ON public.payload_locked_documents USING btree (updated_at);


--
-- Name: payload_migrations_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_migrations_created_at_idx ON public.payload_migrations USING btree (created_at);


--
-- Name: payload_migrations_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_migrations_updated_at_idx ON public.payload_migrations USING btree (updated_at);


--
-- Name: payload_preferences_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_created_at_idx ON public.payload_preferences USING btree (created_at);


--
-- Name: payload_preferences_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_key_idx ON public.payload_preferences USING btree (key);


--
-- Name: payload_preferences_rels_customers_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_customers_id_idx ON public.payload_preferences_rels USING btree (customers_id);


--
-- Name: payload_preferences_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_order_idx ON public.payload_preferences_rels USING btree ("order");


--
-- Name: payload_preferences_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_parent_idx ON public.payload_preferences_rels USING btree (parent_id);


--
-- Name: payload_preferences_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_path_idx ON public.payload_preferences_rels USING btree (path);


--
-- Name: payload_preferences_rels_users_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_rels_users_id_idx ON public.payload_preferences_rels USING btree (users_id);


--
-- Name: payload_preferences_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payload_preferences_updated_at_idx ON public.payload_preferences USING btree (updated_at);


--
-- Name: product_bundles_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_bundles_created_at_idx ON public.product_bundles USING btree (created_at);


--
-- Name: product_bundles_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_bundles_locales_locale_parent_id_unique ON public.product_bundles_locales USING btree (_locale, _parent_id);


--
-- Name: product_bundles_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_bundles_rels_order_idx ON public.product_bundles_rels USING btree ("order");


--
-- Name: product_bundles_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_bundles_rels_parent_idx ON public.product_bundles_rels USING btree (parent_id);


--
-- Name: product_bundles_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_bundles_rels_path_idx ON public.product_bundles_rels USING btree (path);


--
-- Name: product_bundles_rels_products_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_bundles_rels_products_id_idx ON public.product_bundles_rels USING btree (products_id);


--
-- Name: product_bundles_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_bundles_updated_at_idx ON public.product_bundles USING btree (updated_at);


--
-- Name: products_barcode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_barcode_idx ON public.products USING btree (barcode);


--
-- Name: products_brand_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_brand_idx ON public.products USING btree (brand_id);


--
-- Name: products_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_created_at_idx ON public.products USING btree (created_at);


--
-- Name: products_handle_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_handle_idx ON public.products USING btree (handle);


--
-- Name: products_images_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_images_image_idx ON public.products_images USING btree (image_id);


--
-- Name: products_images_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_images_order_idx ON public.products_images USING btree (_order);


--
-- Name: products_images_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_images_parent_id_idx ON public.products_images USING btree (_parent_id);


--
-- Name: products_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_locales_locale_parent_id_unique ON public.products_locales USING btree (_locale, _parent_id);


--
-- Name: products_options_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_options_order_idx ON public.products_options USING btree (_order);


--
-- Name: products_options_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_options_parent_id_idx ON public.products_options USING btree (_parent_id);


--
-- Name: products_options_values_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_options_values_order_idx ON public.products_options_values USING btree (_order);


--
-- Name: products_options_values_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_options_values_parent_id_idx ON public.products_options_values USING btree (_parent_id);


--
-- Name: products_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_rels_categories_id_idx ON public.products_rels USING btree (categories_id);


--
-- Name: products_rels_ingredients_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_rels_ingredients_id_idx ON public.products_rels USING btree (ingredients_id);


--
-- Name: products_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_rels_order_idx ON public.products_rels USING btree ("order");


--
-- Name: products_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_rels_parent_idx ON public.products_rels USING btree (parent_id);


--
-- Name: products_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_rels_path_idx ON public.products_rels USING btree (path);


--
-- Name: products_tags_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_tags_order_idx ON public.products_tags USING btree (_order);


--
-- Name: products_tags_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_tags_parent_id_idx ON public.products_tags USING btree (_parent_id);


--
-- Name: products_thumbnail_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_thumbnail_idx ON public.products USING btree (thumbnail_id);


--
-- Name: products_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_updated_at_idx ON public.products USING btree (updated_at);


--
-- Name: products_variants_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_variants_locales_locale_parent_id_unique ON public.products_variants_locales USING btree (_locale, _parent_id);


--
-- Name: products_variants_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_variants_order_idx ON public.products_variants USING btree (_order);


--
-- Name: products_variants_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_variants_parent_id_idx ON public.products_variants USING btree (_parent_id);


--
-- Name: promo_blocks_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promo_blocks_created_at_idx ON public.promo_blocks USING btree (created_at);


--
-- Name: promo_blocks_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promo_blocks_image_idx ON public.promo_blocks USING btree (image_id);


--
-- Name: promo_blocks_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX promo_blocks_locales_locale_parent_id_unique ON public.promo_blocks_locales USING btree (_locale, _parent_id);


--
-- Name: promo_blocks_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promo_blocks_updated_at_idx ON public.promo_blocks USING btree (updated_at);


--
-- Name: promotion_usages_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotion_usages_created_at_idx ON public.promotion_usages USING btree (created_at);


--
-- Name: promotion_usages_customer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotion_usages_customer_idx ON public.promotion_usages USING btree (customer_id);


--
-- Name: promotion_usages_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotion_usages_email_idx ON public.promotion_usages USING btree (email);


--
-- Name: promotion_usages_promotion_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotion_usages_promotion_idx ON public.promotion_usages USING btree (promotion_id);


--
-- Name: promotion_usages_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotion_usages_updated_at_idx ON public.promotion_usages USING btree (updated_at);


--
-- Name: promotions_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX promotions_code_idx ON public.promotions USING btree (code);


--
-- Name: promotions_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_created_at_idx ON public.promotions USING btree (created_at);


--
-- Name: promotions_locales_locale_parent_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX promotions_locales_locale_parent_id_unique ON public.promotions_locales USING btree (_locale, _parent_id);


--
-- Name: promotions_rels_brands_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_rels_brands_id_idx ON public.promotions_rels USING btree (brands_id);


--
-- Name: promotions_rels_categories_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_rels_categories_id_idx ON public.promotions_rels USING btree (categories_id);


--
-- Name: promotions_rels_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_rels_order_idx ON public.promotions_rels USING btree ("order");


--
-- Name: promotions_rels_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_rels_parent_idx ON public.promotions_rels USING btree (parent_id);


--
-- Name: promotions_rels_path_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_rels_path_idx ON public.promotions_rels USING btree (path);


--
-- Name: promotions_rels_products_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_rels_products_id_idx ON public.promotions_rels USING btree (products_id);


--
-- Name: promotions_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX promotions_updated_at_idx ON public.promotions USING btree (updated_at);


--
-- Name: reviews_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_created_at_idx ON public.reviews USING btree (created_at);


--
-- Name: reviews_images_image_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_images_image_idx ON public.reviews_images USING btree (image_id);


--
-- Name: reviews_images_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_images_order_idx ON public.reviews_images USING btree (_order);


--
-- Name: reviews_images_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_images_parent_id_idx ON public.reviews_images USING btree (_parent_id);


--
-- Name: reviews_product_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_product_idx ON public.reviews USING btree (product_id);


--
-- Name: reviews_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reviews_updated_at_idx ON public.reviews USING btree (updated_at);


--
-- Name: shipping_config_methods_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_config_methods_order_idx ON public.shipping_config_methods USING btree (_order);


--
-- Name: shipping_config_methods_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_config_methods_parent_id_idx ON public.shipping_config_methods USING btree (_parent_id);


--
-- Name: shipping_config_zones_countries_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_config_zones_countries_order_idx ON public.shipping_config_zones_countries USING btree ("order");


--
-- Name: shipping_config_zones_countries_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_config_zones_countries_parent_idx ON public.shipping_config_zones_countries USING btree (parent_id);


--
-- Name: shipping_config_zones_methods_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_config_zones_methods_order_idx ON public.shipping_config_zones_methods USING btree (_order);


--
-- Name: shipping_config_zones_methods_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_config_zones_methods_parent_id_idx ON public.shipping_config_zones_methods USING btree (_parent_id);


--
-- Name: shipping_config_zones_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_config_zones_order_idx ON public.shipping_config_zones USING btree (_order);


--
-- Name: shipping_config_zones_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipping_config_zones_parent_id_idx ON public.shipping_config_zones USING btree (_parent_id);


--
-- Name: site_settings_about_features_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_about_features_order_idx ON public.site_settings_about_features USING btree (_order);


--
-- Name: site_settings_about_features_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_about_features_parent_id_idx ON public.site_settings_about_features USING btree (_parent_id);


--
-- Name: site_settings_about_stats_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_about_stats_order_idx ON public.site_settings_about_stats USING btree (_order);


--
-- Name: site_settings_about_stats_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_about_stats_parent_id_idx ON public.site_settings_about_stats USING btree (_parent_id);


--
-- Name: site_settings_delivery_faq_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_delivery_faq_order_idx ON public.site_settings_delivery_faq USING btree (_order);


--
-- Name: site_settings_delivery_faq_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_delivery_faq_parent_id_idx ON public.site_settings_delivery_faq USING btree (_parent_id);


--
-- Name: site_settings_delivery_methods_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_delivery_methods_order_idx ON public.site_settings_delivery_methods USING btree (_order);


--
-- Name: site_settings_delivery_methods_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_delivery_methods_parent_id_idx ON public.site_settings_delivery_methods USING btree (_parent_id);


--
-- Name: site_settings_delivery_steps_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_delivery_steps_order_idx ON public.site_settings_delivery_steps USING btree (_order);


--
-- Name: site_settings_delivery_steps_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_delivery_steps_parent_id_idx ON public.site_settings_delivery_steps USING btree (_parent_id);


--
-- Name: site_settings_payment_faq_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_payment_faq_order_idx ON public.site_settings_payment_faq USING btree (_order);


--
-- Name: site_settings_payment_faq_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_payment_faq_parent_id_idx ON public.site_settings_payment_faq USING btree (_parent_id);


--
-- Name: site_settings_payment_methods_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_payment_methods_order_idx ON public.site_settings_payment_methods USING btree (_order);


--
-- Name: site_settings_payment_methods_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_settings_payment_methods_parent_id_idx ON public.site_settings_payment_methods USING btree (_parent_id);


--
-- Name: subscribers_confirm_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscribers_confirm_token_idx ON public.subscribers USING btree (confirm_token);


--
-- Name: subscribers_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscribers_created_at_idx ON public.subscribers USING btree (created_at);


--
-- Name: subscribers_customer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscribers_customer_idx ON public.subscribers USING btree (customer_id);


--
-- Name: subscribers_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX subscribers_email_idx ON public.subscribers USING btree (email);


--
-- Name: subscribers_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX subscribers_updated_at_idx ON public.subscribers USING btree (updated_at);


--
-- Name: users_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_created_at_idx ON public.users USING btree (created_at);


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_sessions_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_sessions_order_idx ON public.users_sessions USING btree (_order);


--
-- Name: users_sessions_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_sessions_parent_id_idx ON public.users_sessions USING btree (_parent_id);


--
-- Name: users_updated_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_updated_at_idx ON public.users USING btree (updated_at);


--
-- Name: automatic_discounts_locales automatic_discounts_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatic_discounts_locales
    ADD CONSTRAINT automatic_discounts_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.automatic_discounts(id) ON DELETE CASCADE;


--
-- Name: automatic_discounts_rels automatic_discounts_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatic_discounts_rels
    ADD CONSTRAINT automatic_discounts_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: automatic_discounts_rels automatic_discounts_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatic_discounts_rels
    ADD CONSTRAINT automatic_discounts_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.automatic_discounts(id) ON DELETE CASCADE;


--
-- Name: automatic_discounts_rels automatic_discounts_rels_products_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automatic_discounts_rels
    ADD CONSTRAINT automatic_discounts_rels_products_fk FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: banners banners_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: banners_locales banners_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners_locales
    ADD CONSTRAINT banners_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.banners(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_featured_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_featured_image_id_media_id_fk FOREIGN KEY (featured_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: blog_posts_locales blog_posts_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts_locales
    ADD CONSTRAINT blog_posts_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts_tags blog_posts_tags_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts_tags
    ADD CONSTRAINT blog_posts_tags_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: brands brands_banner_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_banner_id_media_id_fk FOREIGN KEY (banner_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: brands_benefits_locales brands_benefits_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands_benefits_locales
    ADD CONSTRAINT brands_benefits_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.brands_benefits(id) ON DELETE CASCADE;


--
-- Name: brands_benefits brands_benefits_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands_benefits
    ADD CONSTRAINT brands_benefits_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.brands(id) ON DELETE CASCADE;


--
-- Name: brands_locales brands_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands_locales
    ADD CONSTRAINT brands_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.brands(id) ON DELETE CASCADE;


--
-- Name: brands brands_logo_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_logo_id_media_id_fk FOREIGN KEY (logo_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: brands brands_seo_og_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_seo_og_image_id_media_id_fk FOREIGN KEY (seo_og_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: carts carts_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: carts_items carts_items_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts_items
    ADD CONSTRAINT carts_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: carts_items carts_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts_items
    ADD CONSTRAINT carts_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: categories categories_banner_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_banner_id_media_id_fk FOREIGN KEY (banner_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: categories categories_icon_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_icon_id_media_id_fk FOREIGN KEY (icon_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: categories_locales categories_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_locales
    ADD CONSTRAINT categories_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_category_id_categories_id_fk FOREIGN KEY (parent_category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: categories categories_promo_block_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_promo_block_image_id_media_id_fk FOREIGN KEY (promo_block_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: categories_rels categories_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_rels
    ADD CONSTRAINT categories_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: categories_rels categories_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_rels
    ADD CONSTRAINT categories_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: categories categories_seo_og_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_seo_og_image_id_media_id_fk FOREIGN KEY (seo_og_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: customers_addresses customers_addresses_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers_addresses
    ADD CONSTRAINT customers_addresses_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customers_rels customers_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers_rels
    ADD CONSTRAINT customers_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: customers_rels customers_rels_products_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers_rels
    ADD CONSTRAINT customers_rels_products_fk FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: customers_sessions customers_sessions_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers_sessions
    ADD CONSTRAINT customers_sessions_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: ingredients_locales ingredients_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients_locales
    ADD CONSTRAINT ingredients_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;


--
-- Name: loyalty_points loyalty_points_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: loyalty_transactions loyalty_transactions_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: orders orders_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: orders_items orders_items_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders_items
    ADD CONSTRAINT orders_items_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: pages pages_featured_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_featured_image_id_media_id_fk FOREIGN KEY (featured_image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: pages_locales pages_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pages_locales
    ADD CONSTRAINT pages_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_automatic_discounts_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_automatic_discounts_fk FOREIGN KEY (automatic_discounts_id) REFERENCES public.automatic_discounts(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_banners_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_banners_fk FOREIGN KEY (banners_id) REFERENCES public.banners(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_blog_posts_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_blog_posts_fk FOREIGN KEY (blog_posts_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_brands_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_brands_fk FOREIGN KEY (brands_id) REFERENCES public.brands(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_carts_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_carts_fk FOREIGN KEY (carts_id) REFERENCES public.carts(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_customers_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_customers_fk FOREIGN KEY (customers_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_ingredients_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_ingredients_fk FOREIGN KEY (ingredients_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_loyalty_points_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_loyalty_points_fk FOREIGN KEY (loyalty_points_id) REFERENCES public.loyalty_points(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_loyalty_transactions_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_loyalty_transactions_fk FOREIGN KEY (loyalty_transactions_id) REFERENCES public.loyalty_transactions(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_media_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_media_fk FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_orders_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_orders_fk FOREIGN KEY (orders_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_pages_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_locked_documents(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_product_bundles_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_product_bundles_fk FOREIGN KEY (product_bundles_id) REFERENCES public.product_bundles(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_products_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_products_fk FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_promo_blocks_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_promo_blocks_fk FOREIGN KEY (promo_blocks_id) REFERENCES public.promo_blocks(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_promotion_usages_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_promotion_usages_fk FOREIGN KEY (promotion_usages_id) REFERENCES public.promotion_usages(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_promotions_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_promotions_fk FOREIGN KEY (promotions_id) REFERENCES public.promotions(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_reviews_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_reviews_fk FOREIGN KEY (reviews_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_subscribers_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_subscribers_fk FOREIGN KEY (subscribers_id) REFERENCES public.subscribers(id) ON DELETE CASCADE;


--
-- Name: payload_locked_documents_rels payload_locked_documents_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_customers_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_customers_fk FOREIGN KEY (customers_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.payload_preferences(id) ON DELETE CASCADE;


--
-- Name: payload_preferences_rels payload_preferences_rels_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payload_preferences_rels
    ADD CONSTRAINT payload_preferences_rels_users_fk FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_bundles_locales product_bundles_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bundles_locales
    ADD CONSTRAINT product_bundles_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.product_bundles(id) ON DELETE CASCADE;


--
-- Name: product_bundles_rels product_bundles_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bundles_rels
    ADD CONSTRAINT product_bundles_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.product_bundles(id) ON DELETE CASCADE;


--
-- Name: product_bundles_rels product_bundles_rels_products_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_bundles_rels
    ADD CONSTRAINT product_bundles_rels_products_fk FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_brands_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_brands_id_fk FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: products_images products_images_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_images
    ADD CONSTRAINT products_images_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: products_images products_images_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_images
    ADD CONSTRAINT products_images_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products_locales products_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_locales
    ADD CONSTRAINT products_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products_options products_options_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_options
    ADD CONSTRAINT products_options_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products_options_values products_options_values_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_options_values
    ADD CONSTRAINT products_options_values_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products_options(id) ON DELETE CASCADE;


--
-- Name: products_rels products_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_rels
    ADD CONSTRAINT products_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: products_rels products_rels_ingredients_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_rels
    ADD CONSTRAINT products_rels_ingredients_fk FOREIGN KEY (ingredients_id) REFERENCES public.ingredients(id) ON DELETE CASCADE;


--
-- Name: products_rels products_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_rels
    ADD CONSTRAINT products_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products_tags products_tags_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_tags
    ADD CONSTRAINT products_tags_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_thumbnail_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_thumbnail_id_media_id_fk FOREIGN KEY (thumbnail_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: products_variants_locales products_variants_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_variants_locales
    ADD CONSTRAINT products_variants_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products_variants(id) ON DELETE CASCADE;


--
-- Name: products_variants products_variants_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products_variants
    ADD CONSTRAINT products_variants_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: promo_blocks promo_blocks_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_blocks
    ADD CONSTRAINT promo_blocks_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: promo_blocks_locales promo_blocks_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_blocks_locales
    ADD CONSTRAINT promo_blocks_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.promo_blocks(id) ON DELETE CASCADE;


--
-- Name: promotion_usages promotion_usages_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_usages
    ADD CONSTRAINT promotion_usages_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: promotion_usages promotion_usages_promotion_id_promotions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_usages
    ADD CONSTRAINT promotion_usages_promotion_id_promotions_id_fk FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE SET NULL;


--
-- Name: promotions_locales promotions_locales_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions_locales
    ADD CONSTRAINT promotions_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.promotions(id) ON DELETE CASCADE;


--
-- Name: promotions_rels promotions_rels_brands_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions_rels
    ADD CONSTRAINT promotions_rels_brands_fk FOREIGN KEY (brands_id) REFERENCES public.brands(id) ON DELETE CASCADE;


--
-- Name: promotions_rels promotions_rels_categories_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions_rels
    ADD CONSTRAINT promotions_rels_categories_fk FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: promotions_rels promotions_rels_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions_rels
    ADD CONSTRAINT promotions_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public.promotions(id) ON DELETE CASCADE;


--
-- Name: promotions_rels promotions_rels_products_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions_rels
    ADD CONSTRAINT promotions_rels_products_fk FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews_images reviews_images_image_id_media_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews_images
    ADD CONSTRAINT reviews_images_image_id_media_id_fk FOREIGN KEY (image_id) REFERENCES public.media(id) ON DELETE SET NULL;


--
-- Name: reviews_images reviews_images_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews_images
    ADD CONSTRAINT reviews_images_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.reviews(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: shipping_config_methods shipping_config_methods_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config_methods
    ADD CONSTRAINT shipping_config_methods_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.shipping_config(id) ON DELETE CASCADE;


--
-- Name: shipping_config_zones_countries shipping_config_zones_countries_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config_zones_countries
    ADD CONSTRAINT shipping_config_zones_countries_parent_fk FOREIGN KEY (parent_id) REFERENCES public.shipping_config_zones(id) ON DELETE CASCADE;


--
-- Name: shipping_config_zones_methods shipping_config_zones_methods_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config_zones_methods
    ADD CONSTRAINT shipping_config_zones_methods_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.shipping_config_zones(id) ON DELETE CASCADE;


--
-- Name: shipping_config_zones shipping_config_zones_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipping_config_zones
    ADD CONSTRAINT shipping_config_zones_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.shipping_config(id) ON DELETE CASCADE;


--
-- Name: site_settings_about_features site_settings_about_features_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_about_features
    ADD CONSTRAINT site_settings_about_features_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.site_settings(id) ON DELETE CASCADE;


--
-- Name: site_settings_about_stats site_settings_about_stats_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_about_stats
    ADD CONSTRAINT site_settings_about_stats_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.site_settings(id) ON DELETE CASCADE;


--
-- Name: site_settings_delivery_faq site_settings_delivery_faq_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_delivery_faq
    ADD CONSTRAINT site_settings_delivery_faq_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.site_settings(id) ON DELETE CASCADE;


--
-- Name: site_settings_delivery_methods site_settings_delivery_methods_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_delivery_methods
    ADD CONSTRAINT site_settings_delivery_methods_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.site_settings(id) ON DELETE CASCADE;


--
-- Name: site_settings_delivery_steps site_settings_delivery_steps_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_delivery_steps
    ADD CONSTRAINT site_settings_delivery_steps_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.site_settings(id) ON DELETE CASCADE;


--
-- Name: site_settings_payment_faq site_settings_payment_faq_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_payment_faq
    ADD CONSTRAINT site_settings_payment_faq_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.site_settings(id) ON DELETE CASCADE;


--
-- Name: site_settings_payment_methods site_settings_payment_methods_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings_payment_methods
    ADD CONSTRAINT site_settings_payment_methods_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.site_settings(id) ON DELETE CASCADE;


--
-- Name: subscribers subscribers_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscribers
    ADD CONSTRAINT subscribers_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: users_sessions users_sessions_parent_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_sessions
    ADD CONSTRAINT users_sessions_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict K7BdirUJLGa5U5sS8lD95COxNQMCnM2IPDKeNHlyUdxPqavusocn92e9JdZ1hF5

