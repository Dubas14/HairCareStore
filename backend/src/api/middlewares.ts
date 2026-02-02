import { defineMiddlewares, authenticate } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    // Wishlist API routes - require authentication
    {
      matcher: "/store/wishlist",
      middlewares: [
        authenticate("customer", ["bearer", "session"]),
      ],
    },
    {
      matcher: "/store/wishlist/*",
      middlewares: [
        authenticate("customer", ["bearer", "session"]),
      ],
    },
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
    // Admin Loyalty API routes
    {
      matcher: "/admin/loyalty",
      middlewares: [
        authenticate("user", ["bearer", "session"]),
      ],
    },
    {
      matcher: "/admin/loyalty/*",
      middlewares: [
        authenticate("user", ["bearer", "session"]),
      ],
    },
  ],
})
