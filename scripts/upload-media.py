#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Upload media to Payload CMS and update brands, products, blog posts, banners.
Requires: dev server running at localhost:3200
Usage: python scripts/upload-media.py
"""
import sys
import os
import json
import time
import requests
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://localhost:3200/api'
SEED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seed-data')
IMAGES_DIR = os.path.join(SEED_DIR, 'images')

AUTH_TOKEN = None
HEADERS = {}  # No Content-Type for multipart uploads


def api_json(method, path, data=None, params=None):
    """JSON API call."""
    url = f'{BASE_URL}/{path}'
    headers = {'Content-Type': 'application/json'}
    if AUTH_TOKEN:
        headers['Authorization'] = f'JWT {AUTH_TOKEN}'
    kwargs = {'headers': headers, 'timeout': 30}
    if params:
        kwargs['params'] = params
    if data:
        kwargs['json'] = data

    if method == 'GET':
        r = requests.get(url, **kwargs)
    elif method == 'POST':
        r = requests.post(url, **kwargs)
    elif method == 'PATCH':
        r = requests.patch(url, **kwargs)
    else:
        raise ValueError(f'Unknown method: {method}')

    if r.status_code >= 400:
        try:
            err = r.json()
        except Exception:
            err = r.text[:300]
        return None, err
    return r.json(), None


def upload_media(filepath, alt_text):
    """Upload image file to Payload media collection."""
    url = f'{BASE_URL}/media'
    headers = {}
    if AUTH_TOKEN:
        headers['Authorization'] = f'JWT {AUTH_TOKEN}'

    with open(filepath, 'rb') as f:
        files = {'file': (os.path.basename(filepath), f, 'image/png')}
        data = {'alt': alt_text}
        r = requests.post(url, headers=headers, files=files, data=data, timeout=60)

    if r.status_code >= 400:
        try:
            err = r.json()
        except Exception:
            err = r.text[:300]
        return None, err
    return r.json(), None


def find_one(collection, field, value):
    """Find a single document by field value."""
    result, err = api_json('GET', collection, params={
        f'where[{field}][equals]': value,
        'limit': '1'
    })
    if err or not result:
        return None
    docs = result.get('docs', [])
    return docs[0] if docs else None


def find_all(collection, limit=500):
    """Get all documents from a collection."""
    result, err = api_json('GET', collection, params={'limit': str(limit)})
    if err or not result:
        return []
    return result.get('docs', [])


def login():
    """Login to get auth token."""
    global AUTH_TOKEN
    r = requests.post(
        f'{BASE_URL}/users/login',
        json={'email': 'ev.hanzha@gmail.com', 'password': 'Admin123!'},
        headers={'Content-Type': 'application/json'},
        timeout=10
    )
    if r.status_code == 200:
        data = r.json()
        AUTH_TOKEN = data.get('token')
        if AUTH_TOKEN:
            print('  Logged in as admin')
            return True
    print('  Proceeding without auth')
    return True


def img_path(brand, filename):
    """Get full path to image."""
    return os.path.join(IMAGES_DIR, brand, filename)


def main():
    print('=' * 60)
    print('  HAIR LAB — Media Upload to Payload CMS')
    print('=' * 60)

    # Check API
    try:
        r = requests.get(f'{BASE_URL}/media?limit=0', timeout=5)
        r.raise_for_status()
    except Exception:
        print(f'Cannot reach Payload API at {BASE_URL}')
        print('Make sure dev server is running: cd frontend && npm run dev')
        sys.exit(1)

    login()

    # Track uploaded media IDs
    media_ids = {}  # key -> media_id

    # ═══════════════════════════════════════════════════════════
    # 1. BRAND BANNERS
    # ═══════════════════════════════════════════════════════════
    print('\n' + '=' * 60)
    print('  1. BRAND BANNERS')
    print('=' * 60)

    brand_banners = {
        'elgon': {
            'file': img_path('elgon', 'affixx-ua_p13_img1.png'),
            'alt': 'Elgon AFFIXX — професійна лінія стайлінгу',
        },
        'mood': {
            'file': img_path('mood', 'new-mood-hairstyling-bodyguard-ua-1_s27_img1.png'),
            'alt': 'MOOD — сучасний догляд за волоссям',
        },
        'nevitaly': {
            'file': img_path('mood', 'onovlenyy-kataloh-mood_p17_img1.png'),  # 3 models works better as general
            'alt': 'Nevitaly — натуральна косметика для волосся',
        },
        'inebrya': {
            'file': img_path('inebrya', 'prays-inebrya-2026-salony-druk_p1_img1.png'),
            'alt': 'Inebrya — професійна італійська косметика',
        },
    }

    # Need to crop/resize Inebrya banner (too tall) and Nevitaly
    # First, prepare cropped versions
    prepared_dir = os.path.join(SEED_DIR, 'prepared')
    os.makedirs(prepared_dir, exist_ok=True)

    # Crop Inebrya banner to landscape (top portion with model face)
    inebrya_src = img_path('inebrya', 'prays-inebrya-2026-salony-druk_p1_img1.png')
    inebrya_banner = os.path.join(prepared_dir, 'inebrya-banner.png')
    if not os.path.exists(inebrya_banner):
        im = Image.open(inebrya_src)
        w, h = im.size
        # Crop top 60% for model portrait -> landscape banner
        crop_h = int(h * 0.55)
        cropped = im.crop((0, 0, w, crop_h))
        # Resize to reasonable banner size
        cropped = cropped.resize((1200, int(1200 * crop_h / w)), Image.LANCZOS)
        cropped.save(inebrya_banner, quality=90)
        print(f'  Prepared Inebrya banner: {cropped.size}')
    brand_banners['inebrya']['file'] = inebrya_banner

    # Use Nevitaly vision moodboard
    brand_banners['nevitaly']['file'] = img_path('nevitaly', 'kataloh-nevitaly-prays_p2_img1.png')

    for slug, info in brand_banners.items():
        key = f'brand-banner-{slug}'
        print(f'  Uploading {slug} banner...')
        result, err = upload_media(info['file'], info['alt'])
        if err:
            print(f'    Error: {err}')
            continue
        media_id = result['doc']['id']
        media_ids[key] = media_id
        print(f'    OK (id={media_id})')

    # Update brands with banner
    print('\n  Updating brands with banners...')
    brands = find_all('brands')
    for brand in brands:
        slug = brand.get('slug', '')
        key = f'brand-banner-{slug}'
        if key in media_ids:
            result, err = api_json('PATCH', f'brands/{brand["id"]}', {
                'banner': media_ids[key],
            })
            if err:
                print(f'    Error updating {slug}: {err}')
            else:
                print(f'    {slug} banner updated')

    # ═══════════════════════════════════════════════════════════
    # 2. PRODUCT IMAGES BY BRAND/LINE
    # ═══════════════════════════════════════════════════════════
    print('\n' + '=' * 60)
    print('  2. PRODUCT IMAGES')
    print('=' * 60)

    # Upload key product images grouped by product line
    product_images = [
        # Elgon products
        {'file': 'elgon/novynky-yes-essential-ua_p8_img4.png',
         'alt': 'Elgon YES Essential — професійний догляд',
         'brand': 'elgon', 'keywords': ['yes essential', 'essential']},
        {'file': 'elgon/affixx-ua_p13_img1.png',
         'alt': 'Elgon AFFIXX — стайлінг-продукти',
         'brand': 'elgon', 'keywords': ['affixx', 'стайлінг']},
        {'file': 'elgon/kataloh-elgon-ua_p4_img1.png',
         'alt': 'Elgon — фарба для волосся',
         'brand': 'elgon', 'keywords': ['i-light', 'moda&styling', 'color', 'фарба']},
        {'file': 'elgon/kataloh-elgon-ua_p13_img1.png',
         'alt': 'Elgon — професійний догляд',
         'brand': 'elgon', 'keywords': ['refibra', 'luminoil', 'шампунь', 'маска', 'кондиціонер', 'догляд']},
        {'file': 'elgon/kataloh-elgon-ua_p10_img1.png',
         'alt': 'Elgon — колор-стилі',
         'brand': 'elgon', 'keywords': ['man', 'чоловік']},
        {'file': 'elgon/elgon-scalpcare-protokoly_p1_img1.png',
         'alt': 'Elgon Primaria — догляд за шкірою голови',
         'brand': 'elgon', 'keywords': ['primaria', 'scalpcare', 'шкіра', 'скальп']},

        # MOOD products
        {'file': 'mood/mood-body-builder-prezentatsiya_p4_img1.png',
         'alt': 'MOOD Body Builder — об\'єм для тонкого волосся',
         'brand': 'mood', 'keywords': ['body builder', "об'єм"]},
        {'file': 'mood/mood-suncare-ua_p1_img1.png',
         'alt': 'MOOD Suncare — сонцезахист для волосся',
         'brand': 'mood', 'keywords': ['suncare', 'sun', 'сонце']},
        {'file': 'mood/mood-body-builder-prezentatsiya_p25_img1.png',
         'alt': 'MOOD — стайлінг та укладка',
         'brand': 'mood', 'keywords': ['bodyguard', 'стайлінг', 'hairspray', 'лак']},
        {'file': 'mood/onovlenyy-kataloh-mood_p17_img1.png',
         'alt': 'MOOD — професійний догляд',
         'brand': 'mood', 'keywords': ['color protect', 'daily care', 'silver', 'шампунь', 'маска', 'кондиціонер', 'догляд']},
        {'file': 'mood/mood-body-builder-prezentatsiya_p3_img1.png',
         'alt': 'MOOD — результат догляду',
         'brand': 'mood', 'keywords': ['dream curls', 'кучері', 'curl']},

        # Nevitaly products
        {'file': 'nevitaly/kataloh-nevitaly-prays_p5_img6.png',
         'alt': 'Nevitaly — кольорові маски',
         'brand': 'nevitaly', 'keywords': ['color mask', 'кольорова маска', 'тонуючий']},
        {'file': 'nevitaly/kataloh-nevitaly-prays_p7_img8.png',
         'alt': 'Nevitaly NAT.INFUSION Filler Sublime',
         'brand': 'nevitaly', 'keywords': ['filler', 'sublime', 'nat.infusion']},
        {'file': 'nevitaly/kataloh-nevitaly-prays_p10_img1.png',
         'alt': 'Nevitaly NAT.INFUSION — натуральний догляд',
         'brand': 'nevitaly', 'keywords': ['nat.infusion', 'шампунь', 'маска', 'кондиціонер']},
        {'file': 'nevitaly/kataloh-nevitaly-prays_p11_img1.png',
         'alt': 'Nevitaly OILISTHIC — догляд за шкірою голови',
         'brand': 'nevitaly', 'keywords': ['oilisthic', 'scalp', 'шкіра голови']},
        {'file': 'nevitaly/kataloh-nevitaly-prays_p5_img5.png',
         'alt': 'Nevitaly NEV.BLONDE — освітлення',
         'brand': 'nevitaly', 'keywords': ['blonde', 'освітлення', 'знебарвлення']},
        {'file': 'nevitaly/kataloh-nevitaly-prays_p3_img1.png',
         'alt': 'Nevitaly — натуральні інгредієнти',
         'brand': 'nevitaly', 'keywords': ['nev color', 'фарба', 'color']},

        # Inebrya products
        {'file': 'inebrya/prays-inebrya-2026-mahazyny-druk_p3_img3.png',
         'alt': 'Inebrya Bionic Color — безаміачна фарба',
         'brand': 'inebrya', 'keywords': ['bionic', 'безаміачна']},
        {'file': 'inebrya/prays-inebrya-2026-mahazyny-druk_p3_img1.png',
         'alt': 'Inebrya Color — професійна фарба',
         'brand': 'inebrya', 'keywords': ['inebrya color', 'фарба', 'color']},
        {'file': 'inebrya/prays-inebrya-2026-mahazyny-druk_p2_img10.png',
         'alt': 'Inebrya Demi — деміперманентна фарба',
         'brand': 'inebrya', 'keywords': ['demi', 'деміперманент']},
        {'file': 'inebrya/prays-inebrya-2026-mahazyny-druk_p4_img11.png',
         'alt': 'Inebrya Blondesse — засоби для освітлення',
         'brand': 'inebrya', 'keywords': ['blondesse', 'blonde', 'освітлення']},
        {'file': 'inebrya/prays-inebrya-2026-mahazyny-druk_p5_img1.png',
         'alt': 'Inebrya Blondesse No-Orange Mask',
         'brand': 'inebrya', 'keywords': ['no-orange', 'no-yellow', 'mask', 'маска']},
        {'file': 'inebrya/prays-inebrya-2026-mahazyny-druk_p2_img1.png',
         'alt': 'Inebrya Style — стайлінг',
         'brand': 'inebrya', 'keywords': ['style', 'стайлінг', 'об\'єм', 'лак']},
    ]

    # Upload all product images
    uploaded_product_images = []  # list of {media_id, brand, keywords, alt}
    for i, pimg in enumerate(product_images):
        filepath = os.path.join(IMAGES_DIR, pimg['file'])
        if not os.path.exists(filepath):
            print(f'  Skip (not found): {pimg["file"]}')
            continue
        print(f'  [{i+1}/{len(product_images)}] Uploading {pimg["file"][:50]}...')
        result, err = upload_media(filepath, pimg['alt'])
        if err:
            print(f'    Error: {str(err)[:100]}')
            continue
        mid = result['doc']['id']
        uploaded_product_images.append({
            'media_id': mid,
            'brand': pimg['brand'],
            'keywords': pimg['keywords'],
            'alt': pimg['alt'],
        })
        print(f'    OK (id={mid})')
        time.sleep(0.3)  # gentle rate limit

    print(f'\n  Uploaded {len(uploaded_product_images)} product images')

    # ═══════════════════════════════════════════════════════════
    # 3. ASSIGN THUMBNAILS TO PRODUCTS
    # ═══════════════════════════════════════════════════════════
    print('\n' + '=' * 60)
    print('  3. ASSIGNING THUMBNAILS TO PRODUCTS')
    print('=' * 60)

    # Get all products
    all_products = []
    page = 1
    while True:
        result, err = api_json('GET', 'products', params={
            'limit': '100',
            'page': str(page),
            'depth': '0',
        })
        if err or not result:
            break
        docs = result.get('docs', [])
        if not docs:
            break
        all_products.extend(docs)
        if not result.get('hasNextPage'):
            break
        page += 1

    print(f'  Found {len(all_products)} products')

    # Get all brands to map brand IDs to slugs
    brands_list = find_all('brands')
    brand_id_to_slug = {}
    for b in brands_list:
        brand_id_to_slug[str(b['id'])] = b.get('slug', '')

    # Assign thumbnails based on brand + keyword matching
    assigned = 0
    skipped = 0
    for product in all_products:
        # Skip if already has thumbnail
        if product.get('thumbnail'):
            skipped += 1
            continue

        title_lower = product.get('title', '').lower()
        subtitle_lower = product.get('subtitle', '').lower()
        brand_id = product.get('brand')
        brand_slug = ''
        if brand_id:
            brand_slug = brand_id_to_slug.get(str(brand_id), '')

        # Find best matching image
        best_match = None
        best_score = -1

        for pimg in uploaded_product_images:
            if pimg['brand'] != brand_slug:
                continue
            score = 0
            for kw in pimg['keywords']:
                if kw.lower() in title_lower or kw.lower() in subtitle_lower:
                    score += 2
            # If no keyword match, still use a brand-level image with low score
            if score == 0:
                score = 0.1  # fallback: any brand image
            if score > best_score:
                best_score = score
                best_match = pimg

        if best_match:
            result, err = api_json('PATCH', f'products/{product["id"]}', {
                'thumbnail': best_match['media_id'],
            })
            if err:
                if assigned < 3:
                    print(f'    Error: {product["title"][:40]}: {str(err)[:80]}')
            else:
                assigned += 1
                if assigned % 50 == 0:
                    print(f'    ... {assigned} products updated')

    print(f'  Assigned thumbnails: {assigned} products ({skipped} already had thumbnails)')

    # ═══════════════════════════════════════════════════════════
    # 4. BLOG POST FEATURED IMAGES
    # ═══════════════════════════════════════════════════════════
    print('\n' + '=' * 60)
    print('  4. BLOG POST FEATURED IMAGES')
    print('=' * 60)

    blog_images = {
        'yak-nadaty-obyem-tonkomu-volossyu-z-mood-body-builder': {
            'file': img_path('mood', 'mood-body-builder-prezentatsiya_p4_img1.png'),
            'alt': 'MOOD Body Builder — об\'єм для тонкого волосся',
        },
        'doglyad-za-kucheryavym-volossyam-mood-dream-curls': {
            'file': img_path('mood', 'mood-body-builder-prezentatsiya_p3_img1.png'),
            'alt': 'MOOD Dream Curls — догляд за кучерявим волоссям',
        },
        'keratynovyy-doglyad-dlya-dovhoho-volossya-mood-keratin': {
            'file': img_path('nevitaly', 'kataloh-nevitaly-prays_p4_img1.png'),
            'alt': 'Кератиновий догляд для довгого волосся',
        },
        'zakhyst-volossya-ta-shkiry-vlitku-mood-suncare': {
            'file': img_path('mood', 'mood-suncare-ua_p1_img1.png'),
            'alt': 'MOOD Suncare — захист від сонця',
        },
        'profesiynyy-staylinh-z-elgon-affixx': {
            'file': img_path('elgon', 'affixx-ua_p13_img1.png'),
            'alt': 'Elgon AFFIXX — професійний стайлінг',
        },
        'protokoly-doglyadu-za-shkiroyu-holovy-elgon-primaria': {
            'file': img_path('elgon', 'elgon-scalpcare-protokoly_p1_img1.png'),
            'alt': 'Elgon Primaria — догляд за шкірою голови',
        },
        'novynky-seriyi-yes-essential-vid-elgon': {
            'file': img_path('elgon', 'novynky-yes-essential-ua_p8_img4.png'),
            'alt': 'Elgon YES Essential — новинки серії',
        },
        'ohlyad-profesiynoho-brendu-nevitaly': {
            'file': img_path('nevitaly', 'kataloh-nevitaly-prays_p11_img1.png'),
            'alt': 'Nevitaly — огляд професійного бренду',
        },
    }

    # Upload blog images and update posts
    blog_posts = find_all('blog-posts')
    blog_count = 0

    for post in blog_posts:
        slug = post.get('slug', '')
        if slug not in blog_images:
            print(f'  No image mapping for: {slug}')
            continue
        if post.get('featuredImage'):
            print(f'  Skip (already has image): {post["title"][:40]}')
            continue

        info = blog_images[slug]
        if not os.path.exists(info['file']):
            # Try already uploaded product image
            print(f'  File not found: {info["file"]}')
            continue

        print(f'  Uploading for: {post["title"][:50]}...')
        result, err = upload_media(info['file'], info['alt'])
        if err:
            print(f'    Upload error: {err}')
            continue
        media_id = result['doc']['id']

        # Update blog post
        result, err = api_json('PATCH', f'blog-posts/{post["id"]}', {
            'featuredImage': media_id,
        })
        if err:
            print(f'    Update error: {err}')
        else:
            blog_count += 1
            print(f'    OK')

    print(f'  Blog posts updated: {blog_count}')

    # ═══════════════════════════════════════════════════════════
    # 5. HOMEPAGE BANNERS
    # ═══════════════════════════════════════════════════════════
    print('\n' + '=' * 60)
    print('  5. HOMEPAGE BANNERS')
    print('=' * 60)

    # Prepare wide banner from Inebrya model (crop to wide landscape)
    hero_src = img_path('inebrya', 'prays-inebrya-2026-mahazyny-druk_p1_img1.png')
    hero_banner = os.path.join(prepared_dir, 'hero-banner.png')
    if not os.path.exists(hero_banner):
        im = Image.open(hero_src)
        w, h = im.size
        # Crop to 16:9 center, keeping face
        target_ratio = 16 / 9
        crop_h = int(w / target_ratio)
        top = int(h * 0.05)  # start near top for face
        cropped = im.crop((0, top, w, top + crop_h))
        cropped = cropped.resize((1920, 1080), Image.LANCZOS)
        cropped.save(hero_banner, quality=92)
        print(f'  Prepared hero banner: 1920x1080')

    # Prepare MOOD banner from 3 models
    mood_banner_src = img_path('mood', 'new-mood-hairstyling-bodyguard-ua-1_s27_img1.png')
    mood_banner = os.path.join(prepared_dir, 'mood-banner.png')
    if not os.path.exists(mood_banner):
        im = Image.open(mood_banner_src)
        im = im.resize((1920, int(1920 * im.size[1] / im.size[0])), Image.LANCZOS)
        # Crop to 16:9
        w, h = im.size
        target_h = int(w * 9 / 16)
        top = max(0, (h - target_h) // 2)
        cropped = im.crop((0, top, w, top + target_h))
        cropped.save(mood_banner, quality=92)
        print(f'  Prepared MOOD banner: {cropped.size}')

    # Prepare Nevitaly products banner
    nev_banner_src = img_path('nevitaly', 'kataloh-nevitaly-prays_p11_img1.png')
    nev_banner = os.path.join(prepared_dir, 'nevitaly-banner.png')
    if not os.path.exists(nev_banner):
        im = Image.open(nev_banner_src)
        # Already roughly square, resize to wide landscape
        w, h = im.size
        target_h = int(w * 9 / 16)
        top = max(0, (h - target_h) // 2)
        cropped = im.crop((0, top, w, top + target_h))
        cropped = cropped.resize((1920, 1080), Image.LANCZOS)
        cropped.save(nev_banner, quality=92)
        print(f'  Prepared Nevitaly banner: 1920x1080')

    # Prepare Elgon banner
    elgon_banner_src = img_path('elgon', 'affixx-ua_p13_img1.png')
    elgon_banner = os.path.join(prepared_dir, 'elgon-banner.png')
    if not os.path.exists(elgon_banner):
        im = Image.open(elgon_banner_src)
        im = im.resize((1920, int(1920 * im.size[1] / im.size[0])), Image.LANCZOS)
        w, h = im.size
        target_h = int(w * 9 / 16)
        top = max(0, (h - target_h) // 2)
        cropped = im.crop((0, top, w, top + target_h))
        cropped.save(elgon_banner, quality=92)
        print(f'  Prepared Elgon banner: {cropped.size}')

    banners_data = [
        {
            'title': 'Професійна косметика для волосся — HAIR LAB',
            'file': hero_banner,
            'alt': 'HAIR LAB — професійна косметика для волосся',
            'link': '/shop',
            'position': 'home',
            'order': 0,
        },
        {
            'title': 'MOOD — стайлінг та захист',
            'file': mood_banner,
            'alt': 'MOOD — сучасний догляд та стайлінг',
            'link': '/brands/mood',
            'position': 'home',
            'order': 1,
        },
        {
            'title': 'Nevitaly — натуральний догляд',
            'file': nev_banner,
            'alt': 'Nevitaly OILISTHIC — натуральний догляд за волоссям',
            'link': '/brands/nevitaly',
            'position': 'home',
            'order': 2,
        },
        {
            'title': 'Elgon AFFIXX — професійний стайлінг',
            'file': elgon_banner,
            'alt': 'Elgon AFFIXX — професійна лінія стайлінгу',
            'link': '/brands/elgon',
            'position': 'home',
            'order': 3,
        },
    ]

    banner_count = 0
    for banner in banners_data:
        # Check if banner with same title exists
        existing = find_one('banners', 'title', banner['title'])
        if existing:
            print(f'  Skip (exists): {banner["title"][:50]}')
            continue

        if not os.path.exists(banner['file']):
            print(f'  Skip (no file): {banner["title"][:50]}')
            continue

        print(f'  Uploading banner: {banner["title"][:50]}...')
        result, err = upload_media(banner['file'], banner['alt'])
        if err:
            print(f'    Upload error: {err}')
            continue
        media_id = result['doc']['id']

        # Create banner entry
        result, err = api_json('POST', 'banners', {
            'title': banner['title'],
            'image': media_id,
            'link': banner['link'],
            'position': banner['position'],
            'order': banner['order'],
            'isActive': True,
            'mediaType': 'image',
        })
        if err:
            print(f'    Create error: {err}')
        else:
            banner_count += 1
            print(f'    OK')

    print(f'  Banners created: {banner_count}')

    # ═══════════════════════════════════════════════════════════
    # SUMMARY
    # ═══════════════════════════════════════════════════════════
    print('\n' + '=' * 60)
    print('  MEDIA UPLOAD COMPLETE')
    print('=' * 60)
    print(f'  Brand banners:      {len([k for k in media_ids if k.startswith("brand-banner")])}')
    print(f'  Product images:     {len(uploaded_product_images)}')
    print(f'  Products updated:   {assigned}')
    print(f'  Blog posts:         {blog_count}')
    print(f'  Homepage banners:   {banner_count}')
    print('=' * 60)


if __name__ == '__main__':
    main()
