# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/dist ./dist

RUN mkdir -p ./uploads

EXPOSE 9000

CMD ["npm", "run", "start"]
