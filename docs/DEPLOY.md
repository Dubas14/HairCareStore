# DEPLOY — HAIR LAB Production

**ОБОВ'ЯЗКОВІ ПРАВИЛА:**

Сервер hairlab.makeweb.top (136.243.150.97, SSH порт 44204) має СТАРИЙ CPU без SSE4.2/AVX.

**ЗАБОРОНЕНО:**
- `output: 'standalone'` в next.config.ts — sharp бандлиться в server.js, stub не працює
- `npm run build` на сервері — webpack image-loader крашить на @payloadcms/ui PNG файлах через sharp
- `npm rebuild sharp --build-from-source` — node-gyp не знаходить glib-object.h навіть з libglib2.0-dev
- `ln -s` для медіа/public в standalone — рекурсивні петлі ELOOP

**ОБОВ'ЯЗКОВО:**
- `images: { unoptimized: true }` в next.config.ts (вже є)
- Білд ТІЛЬКИ ЛОКАЛЬНО на Windows/Mac машині
- PM2 запуск: `pm2 start npm --name hair-lab -- start` (звичайний next start, НЕ standalone)
- Sharp stub скрипт `/tmp/fix-sharp.sh` на сервері (замінює sharp на no-op)
- nginx location `/api/media/file/` → alias на `/var/www/HairCareStore/frontend/media/` (обходить Payload media API який використовує sharp)

**ПРОЦЕС ДЕПЛОЮ (5 хвилин):**

```bash
# 1. ЛОКАЛЬНО:
cd D:\Progect\HairCareStore\frontend
npm run build
tar -czf next-build.tar.gz .next
scp -P 44204 next-build.tar.gz root@136.243.150.97:/var/www/HairCareStore/frontend/

# 2. НА СЕРВЕРІ:
cd /var/www/HairCareStore
git pull origin main
cd frontend
rm -rf .next
tar -xzf next-build.tar.gz
rm next-build.tar.gz
bash /tmp/fix-sharp.sh
pm2 restart hair-lab
```

**ЯКЩО PM2 НЕ ІСНУЄ:**
```bash
cd /var/www/HairCareStore/frontend
pm2 start npm --name hair-lab -- start
pm2 save
```

**ЯКЩО ПОТРІБНО ОНОВИТИ БД:**
```bash
# Локально:
docker exec beauty-postgres pg_dump -U postgres -d payload --no-owner --no-privileges --encoding=UTF8 -f /tmp/dump.sql
docker cp beauty-postgres:/tmp/dump.sql ./scripts/full-dump.sql
scp -P 44204 scripts/full-dump.sql root@136.243.150.97:/tmp/full-dump.sql

# На сервері:
docker exec -i beauty-postgres psql -U payload_user -d postgres -c "DROP DATABASE payload;"
docker exec -i beauty-postgres psql -U payload_user -d postgres -c "CREATE DATABASE payload;"
docker exec -i beauty-postgres psql -U payload_user -d payload < /tmp/full-dump.sql
```

**ЯКЩО ПОТРІБНО ОНОВИТИ МЕДІА:**
```bash
scp -P 44204 -r frontend/media/* root@136.243.150.97:/var/www/HairCareStore/frontend/media/
# На сервері: chmod -R 755 /var/www/HairCareStore/frontend/media/
```

**ІСТОРІЯ ПРОБЛЕМ:**
- 2026-03-17: перший деплой, 3+ годин на sharp + standalone + symlinks
- 2026-03-18: другий деплой, 2+ годин — білд на сервері перестав працювати через @payloadcms/ui PNG assets що тригерять webpack image-loader -> sharp. Рішення: білд тільки локально, без standalone.
- Причина зміни: раніше webpack не обробляв Payload UI PNG файли через sharp, після оновлення залежностей — почав. `unoptimized: true` впливає тільки на `<Image>` компоненти, а не на webpack static imports.
