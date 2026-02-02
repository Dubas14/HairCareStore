import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    // Loyalty API routes - allow through, check auth in handler
    {
      matcher: "/store/loyalty",
      middlewares: [
        authenticate("customer", ["bearer", "session"], { allowUnauthenticated: true }),
      ],
    },
    {
      matcher: "/store/loyalty/*",
      middlewares: [
        authenticate("customer", ["bearer", "session"], { allowUnauthenticated: true }),
      ],
    },
  ],
})
