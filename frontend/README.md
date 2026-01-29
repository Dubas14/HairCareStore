# Beauty Hair Store Frontend

Next.js 15 storefront for professional hair care products.

## Features

- **Next.js 15 App Router**: Modern React framework with server components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality UI components
- **Medusa Integration**: E-commerce functionality
- **MDX Blog**: Content management with MDX

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
app/                    # Next.js App Router
├── (shop)/            # Shop pages (products, cart, checkout)
├── (account)/         # User account pages
├── (content)/         # Content pages (blog, brands, quiz)
├── layout.tsx         # Root layout
└── page.tsx           # Home page

components/            # React components
├── ui/               # Shadcn/ui components
├── layout/           # Layout components (header, footer)
├── products/         # Product components
└── cart/             # Cart components

lib/                  # Utilities
├── medusa/          # Medusa client and API calls
├── utils.ts         # Helper functions
└── constants.ts     # App constants

hooks/               # Custom React hooks
content/blog/        # MDX blog posts
public/              # Static assets
```

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9100
NEXT_PUBLIC_STORE_URL=http://localhost:3100
```

## Available Routes

- `/` - Home page
- `/products` - Product catalog
- `/products/[handle]` - Product detail
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/account` - User account
- `/blog` - Blog
- `/quiz` - Product quiz
