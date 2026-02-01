# HAIR LAB - Project Documentation

## Architecture

```
HairCareStore/
├── backend/          # Medusa 2.x (e-commerce engine)
├── frontend/         # Next.js 15 (storefront)
├── cms/              # Strapi 5 (content management)
└── docker-compose.yml
```

## Ports

| Service    | Port |
|------------|------|
| Frontend   | 3200 |
| Backend    | 9000 |
| Strapi CMS | 1337 |
| PostgreSQL | 5450 |
| Redis      | 6390 |

**ВАЖЛИВО**: Backend запускається ЛОКАЛЬНО (не Docker) через `cd backend && npm run dev`

## Strapi CMS

### Content Types

- **Banner** - Hero banners with image/video support
- **PromoBlock** - Promotional blocks
- **Page** - Static pages (About, Delivery, etc.)

### Media Field - Video Support

Strapi `Media` field supports both images and videos automatically:

1. In Content-Type Builder → Edit field → **Advanced Settings**
2. **Select allowed types of media**: Enable `videos (MPEG, MP4, Quicktime, WMV, AVI, FLV)`
3. Upload video file to media field
4. Frontend checks `mime` type to render `<video>` or `<img>`

```typescript
// lib/strapi/client.ts
export function isVideoMedia(media?: StrapiMedia): boolean {
  return media?.mime?.startsWith('video/') ?? false
}
```

### API Access

Public API endpoints (after configuring permissions):
- `GET /api/banners?populate=*` - All banners with media
- `GET /api/promo-blocks?populate=*` - Promo blocks
- `GET /api/pages?filters[slug][$eq]=about` - Page by slug

### Permissions Setup

Settings → Users & Permissions → Roles → Public:
- Banner: `find`, `findOne`
- PromoBlock: `find`, `findOne`
- Page: `find`, `findOne`

## Medusa Backend

### Admin Access

- URL: `http://localhost:9000/app`
- Create user: `npx medusa user -e email@example.com -p password`

### Scripts

```bash
cd backend

# Setup categories and collections
npx medusa exec ./src/scripts/setup-categories-collections.ts

# Setup product variants (250ml, 500ml, 1000ml)
npx medusa exec ./src/scripts/setup-product-variants.ts

# Setup pricing and promotions
npx medusa exec ./src/scripts/setup-pricing-promotions.ts
```

### Promo Codes

| Code       | Discount | Description              |
|------------|----------|--------------------------|
| WELCOME15  | 15%      | New customers            |
| SALE10     | 10%      | All orders               |
| HAIRCARE20 | 20%      | Hair care products       |
| FREESHIP   | 100%     | Free shipping            |

### Admin UI Customization

Font size override via widget injection:
- `backend/src/admin/widgets/test-widget.tsx`
- `backend/src/admin/utils/inject-font-styles.ts`

## Frontend

### Environment Variables

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### Strapi Integration

```typescript
// Fetch banners for homepage
import { getBanners } from '@/lib/strapi/client'
const banners = await getBanners('home')
```

## Development

### Start Services

```bash
# Start databases (Docker)
docker-compose up -d postgres redis

# Start Medusa backend
cd backend && npm run dev

# Start Strapi CMS
cd cms && npm run develop

# Start Frontend
cd frontend && npm run dev
```

### Database

- Medusa: `postgres://postgres:postgres123@localhost:5450/medusa`
- Strapi: `postgres://postgres:postgres123@localhost:5450/strapi`
