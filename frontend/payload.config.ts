import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import {
  Media,
  Users,
  Banners,
  Pages,
  PromoBlocks,
  Brands,
  Categories,
  BlogPosts,
  Reviews,
  Products,
  Customers,
  Carts,
  Orders,
  LoyaltyPoints,
  LoyaltyTransactions,
} from './collections'
import { LoyaltySettings } from './globals/LoyaltySettings'
import { ShippingConfig } from './globals/ShippingConfig'
import { SiteSettings } from './globals/SiteSettings'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me-in-production',


  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL || 'postgres://postgres:postgres123@localhost:5450/payload',
    },
  }),

  editor: lexicalEditor(),
  sharp,

  collections: [
    Media,
    Users,
    Banners,
    Pages,
    PromoBlocks,
    Brands,
    Categories,
    BlogPosts,
    Reviews,
    Products,
    Customers,
    Carts,
    Orders,
    LoyaltyPoints,
    LoyaltyTransactions,
  ],

  globals: [
    LoyaltySettings,
    ShippingConfig,
    SiteSettings,
  ],

  admin: {
    user: 'users',
    theme: 'all',
    meta: {
      titleSuffix: ' - HAIR LAB CMS',
    },
    components: {
      providers: ['/components/payload/NavProvider'],
      graphics: {
        Logo: '/components/payload/Logo',
        Icon: '/components/payload/Icon',
      },
      beforeDashboard: ['/components/payload/Dashboard'],
      beforeLogin: ['/components/payload/BeforeLogin'],
      afterLogin: ['/components/payload/AfterLogin'],
      afterNavLinks: ['/components/payload/LoyaltyNavLink', '/components/payload/SitePagesNavLink', '/components/payload/ShippingNavLink'],
    },
  },

  typescript: {
    outputFile: './payload-types.ts',
  },
})
