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
  ],

  admin: {
    user: 'users',
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
      afterNavLinks: ['/components/payload/LoyaltyNavLink'],
      views: {
        loyaltyDashboard: {
          Component: '/components/payload/loyalty/LoyaltyDashboardView',
          path: '/loyalty',
          exact: true,
        },
        loyaltySettings: {
          Component: '/components/payload/loyalty/LoyaltySettingsView',
          path: '/loyalty/settings',
          exact: true,
        },
        loyaltyCustomers: {
          Component: '/components/payload/loyalty/LoyaltyCustomersView',
          path: '/loyalty/customers',
          exact: true,
        },
        loyaltyCustomerDetail: {
          Component: '/components/payload/loyalty/LoyaltyCustomerDetailView',
          path: '/loyalty/customers/:id',
        },
        loyaltyTransactions: {
          Component: '/components/payload/loyalty/LoyaltyTransactionsView',
          path: '/loyalty/transactions',
          exact: true,
        },
      },
    },
  },

  typescript: {
    outputFile: './payload-types.ts',
  },
})
