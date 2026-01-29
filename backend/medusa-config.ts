import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    },
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
  },
  modules: [
    // Кастомні модулі
    {
      resolve: './src/modules/hair-type',
    },
    {
      resolve: './src/modules/ingredients',
    },
    {
      resolve: './src/modules/quiz',
    },
    {
      resolve: './src/modules/loyalty',
    },
    // Стандартні модулі з налаштуваннями
    {
      resolve: '@medusajs/medusa/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
          // LiqPay provider (кастомний)
          // {
          //   resolve: './src/modules/payment-liqpay',
          //   id: 'liqpay',
          //   options: {
          //     publicKey: process.env.LIQPAY_PUBLIC_KEY,
          //     privateKey: process.env.LIQPAY_PRIVATE_KEY,
          //   },
          // },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/fulfillment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/fulfillment-manual',
            id: 'manual',
          },
          // Nova Poshta provider (кастомний)
          // {
          //   resolve: './src/modules/fulfillment-nova-poshta',
          //   id: 'nova-poshta',
          //   options: {
          //     apiKey: process.env.NOVA_POSHTA_API_KEY,
          //   },
          // },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-local',
            id: 'local',
            options: {
              upload_dir: 'uploads',
            },
          },
          // Cloudinary (для продакшену)
          // {
          //   resolve: 'medusa-file-cloudinary',
          //   id: 'cloudinary',
          //   options: {
          //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          //     api_key: process.env.CLOUDINARY_API_KEY,
          //     api_secret: process.env.CLOUDINARY_API_SECRET,
          //   },
          // },
        ],
      },
    },
  ],
})
