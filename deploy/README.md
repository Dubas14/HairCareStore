# Hair Lab Store — Deploy Guide

## Prerequisites

On the server (Ubuntu 22.04+ recommended):

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker & Docker Compose
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER

# PM2
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx

# Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

## Step 1: Clone Repository

```bash
cd /var/www
git clone git@github.com:YOUR_USER/HairCareStore.git hair-lab
cd hair-lab
```

## Step 2: Configure Environment

```bash
cp frontend/.env.production.example frontend/.env.local
nano frontend/.env.local
```

Fill in:
- `NEXT_PUBLIC_BASE_URL` — your domain (https://your-domain.com)
- `PAYLOAD_DATABASE_URL` — PostgreSQL connection string
- `PAYLOAD_SECRET` — generate with `openssl rand -hex 32`

Create `.env` for Docker Compose:
```bash
cat > .env << 'EOF'
DB_NAME=payload
DB_USER=payload_user
DB_PASSWORD=your_strong_db_password
REDIS_PASSWORD=your_strong_redis_password
EOF
```

## Step 3: Start Databases

```bash
docker compose -f docker-compose.prod.yml up -d
```

Verify:
```bash
docker ps  # both postgres and redis should be running
```

## Step 4: Build Application

```bash
cd frontend
npm ci
npm run build
```

### Copy static + media for standalone

The standalone build requires static files and media to be copied:

```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public 2>/dev/null || true
cp -r media .next/standalone/media 2>/dev/null || true
```

## Step 5: Restore Backup (if migrating)

```bash
cd /var/www/hair-lab
bash scripts/restore.sh ./backup/hair-lab-YYYY-MM-DD_HH-MM
```

## Step 6: Start with PM2

```bash
cd /var/www/hair-lab
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup  # follow instructions to enable auto-start on boot
```

Verify:
```bash
pm2 status
curl http://localhost:3000  # should return HTML
```

## Step 7: Configure Nginx

```bash
# Copy config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/hair-lab
sudo ln -s /etc/nginx/sites-available/hair-lab /etc/nginx/sites-enabled/

# Replace YOUR_DOMAIN with your actual domain
sudo sed -i 's/YOUR_DOMAIN/your-domain.com/g' /etc/nginx/sites-available/hair-lab

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Step 8: SSL Certificate

```bash
# Get certificate (Nginx must be running on port 80)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run  # test renewal
```

## Maintenance

### Update application
```bash
cd /var/www/hair-lab
git pull
cd frontend && npm ci && npm run build
cp -r .next/static .next/standalone/.next/static
cp -r media .next/standalone/media 2>/dev/null || true
pm2 restart hair-lab
```

### View logs
```bash
pm2 logs hair-lab
pm2 logs hair-lab --lines 100
```

### Backup
```bash
cd /var/www/hair-lab
bash scripts/backup.sh
```

### Database access
```bash
docker exec -it beauty-postgres psql -U payload_user -d payload
```

## Ports (internal)

| Service    | Port  | Access      |
|-----------|-------|-------------|
| Next.js   | 3000  | localhost   |
| PostgreSQL| 5432  | localhost   |
| Redis     | 6379  | localhost   |
| Nginx     | 80/443| public      |
