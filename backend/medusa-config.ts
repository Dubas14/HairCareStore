import { loadEnv, defineConfig } from '@medusajs/utils'

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
    // File module - local storage for uploads
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-local',
            id: 'local',
            options: {
              upload_dir: 'static',
              backend_url: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
            },
          },
        ],
      },
    },
    // Fulfillment module - manual provider для Нової Пошти
    {
      resolve: '@medusajs/medusa/fulfillment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/fulfillment-manual',
            id: 'manual',
          },
        ],
      },
    },
    // Payment module - system provider для накладеного платежу
    // Stripe та інші провайдери можна додати пізніше

    // Loyalty module - бонусна система
    {
      resolve: "./src/modules/loyalty",
    },
  ],
})
