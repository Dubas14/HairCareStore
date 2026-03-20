# Hair Lab — Деплой

## Сервери

### ПРОДАКШН — hairlab.com.ua
- **IP:** 89.167.67.88
- **SSH:** `ssh root@89.167.67.88`
- **Пароль:** Ghbrjkmyj11981
- **OS:** Ubuntu 24.04, Node.js 22
- **CPU:** сучасний (sharp працює, білд на сервері працює)
- **DNS:** Cloudflare (Full SSL mode)
- **Реєстратор:** thehost.ua (login: mrdubas)
- **Cloudflare NS:** kate.ns.cloudflare.com, olof.ns.cloudflare.com

### СТАРИЙ — hairlab.makeweb.top
- **IP:** 136.243.150.97
- **SSH:** `ssh -p 44204 root@136.243.150.97`
- **Пароль:** 72LTJDdEZWTjETYYA
- **OS:** Ubuntu, Node.js
- **CPU:** старий (без SSE4.2/AVX — sharp НЕ працює, білд НЕ працює на сервері)

## Стек (обидва сервери)

| Сервіс    | Порт  | Деталі                                     |
|-----------|-------|---------------------------------------------|
| Next.js   | 3200  | PM2 (hair-lab), `next start -p 3200`       |
| PostgreSQL| 5432  | Docker: beauty-postgres, user: payload_user |
| Redis     | 6379  | Docker: beauty-redis                        |
| nginx     | 80/443| proxy → localhost:3200                      |

**Шлях на серверах:** `/var/www/HairCareStore`

## Деплой на hairlab.com.ua (5 хвилин)

```bash
# 1. Пуш
git push origin main

# 2. На сервері
ssh root@89.167.67.88
cd /var/www/HairCareStore && git pull origin main
cd frontend && npx next build
pm2 restart hair-lab
```

## Деплой на hairlab.makeweb.top (білд тільки локально!)

```bash
# 1. Локально
cd frontend
npm run build
tar -czf next-build.tar.gz .next
scp -P 44204 next-build.tar.gz root@136.243.150.97:/var/www/HairCareStore/frontend/

# 2. На сервері
ssh -p 44204 root@136.243.150.97
cd /var/www/HairCareStore && git pull origin main
cd frontend && rm -rf .next && tar -xzf next-build.tar.gz && rm next-build.tar.gz
bash /tmp/fix-sharp.sh
pm2 restart hair-lab
```

### Чому не можна білдити на makeweb.top?
- webpack image-loader тригерить sharp через @payloadcms/ui PNG файли
- `images: { unoptimized: true }` впливає тільки на `<Image>` компоненти, не на webpack
- sharp не ставиться — старий CPU без SSE4.2

## Оновити БД (дамп з локальної → сервер)

```bash
# Локально
docker exec beauty-postgres pg_dump -U postgres -d payload --no-owner --no-privileges --encoding=UTF8 > ./scripts/full-dump.sql

# Копія на сервер (приклад для com.ua)
scp ./scripts/full-dump.sql root@89.167.67.88:/tmp/full-dump.sql

# На сервері
docker exec -i beauty-postgres psql -U payload_user -d postgres -c "DROP DATABASE payload;"
docker exec -i beauty-postgres psql -U payload_user -d postgres -c "CREATE DATABASE payload;"
docker exec -i beauty-postgres psql -U payload_user -d payload < /tmp/full-dump.sql
```

## Оновити медіа

```bash
# Приклад для com.ua
scp -r frontend/media/* root@89.167.67.88:/var/www/HairCareStore/frontend/media/
ssh root@89.167.67.88 "chmod -R 755 /var/www/HairCareStore/frontend/media/"
```

## Логи

```bash
pm2 logs hair-lab
pm2 logs hair-lab --lines 100
```

## Історія проблем

- **2026-03-17:** перший деплой на makeweb.top — 3+ год на sharp + standalone + symlinks
- **2026-03-18:** білд на makeweb.top зламався — webpack почав обробляти Payload UI PNG через sharp. Рішення: білд тільки локально
- **2026-03-19:** переїзд на Hetzner CPX22 (89.167.67.88) — все працює нативно
- **2026-03-20:** SSH ключ злетів на makeweb.top — додали назад через пароль
