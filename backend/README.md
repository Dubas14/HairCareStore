# Beauty Hair Store Backend

Medusa 2.0 e-commerce backend for professional hair care products.

## Features

- **Custom Hair Type Module**: Classification and product recommendations
- **Ingredients Module**: Ingredient database with allergen warnings
- **Quiz Module**: Personalized product recommendation system
- **Payment Integration**: Stripe and LiqPay support
- **File Storage**: Local file storage for product images

## Development

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start development server
npm run dev
```

## Environment Variables

See `.env.example` in the project root.

## API Endpoints

- Admin: `http://localhost:9100/app`
- Store API: `http://localhost:9100/store`
- Health Check: `http://localhost:9100/health`
