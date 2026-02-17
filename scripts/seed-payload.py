#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Seed Payload CMS via REST API for HAIR LAB
Requires: dev server running at localhost:3200

Usage: python scripts/seed-payload.py
"""
import sys
import os
import json
import time
import re
import requests

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://localhost:3200/api'
SEED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seed-data')

# Auth token (will be set after login)
AUTH_TOKEN = None
HEADERS = {'Content-Type': 'application/json'}


def api(method, collection, data=None, params=None):
    """Make API call to Payload REST API."""
    url = f'{BASE_URL}/{collection}'
    kwargs = {'headers': HEADERS, 'timeout': 30}
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
            err = r.text[:200]
        return None, err
    return r.json(), None


def find_one(collection, field, value):
    """Find a single document by field value."""
    result, err = api('GET', collection, params={
        f'where[{field}][equals]': value,
        'limit': '1'
    })
    if err or not result:
        return None
    docs = result.get('docs', [])
    return docs[0] if docs else None


def login():
    """Login to get auth token."""
    global AUTH_TOKEN, HEADERS
    # Try to create admin user first (in case it doesn't exist)
    # Then login
    r = requests.post(f'{BASE_URL}/users/login',
        data=json.dumps({'email': 'ev.hanzha@gmail.com', 'password': 'Admin123!'}),
        headers={'Content-Type': 'application/json'}, timeout=10)

    if r.status_code == 200:
        data = r.json()
        AUTH_TOKEN = data.get('token')
        if AUTH_TOKEN:
            HEADERS['Authorization'] = f'JWT {AUTH_TOKEN}'
            print('✅ Logged in as admin')
            return True

    print('⚠  No auth needed (open access) — proceeding without token')
    return True


def read_json(filename):
    path = os.path.join(SEED_DIR, filename)
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def slugify(text):
    tr = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e',
        'є': 'ye', 'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y',
        'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
        'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya', 'ъ': '', 'ы': 'y',
        'э': 'e', "'": '',
    }
    lower = text.lower().strip()
    result = []
    for ch in lower:
        if ch in tr:
            result.append(tr[ch])
        elif re.match(r'[a-z0-9-]', ch):
            result.append(ch)
        elif ch in ' _./':
            result.append('-')
    slug = re.sub(r'-+', '-', ''.join(result)).strip('-')
    return slug[:80]


def main():
    print('=' * 60)
    print('  HAIR LAB — Payload CMS Seed (REST API)')
    print('=' * 60)

    # Check API
    try:
        r = requests.get(f'{BASE_URL}/categories?limit=0', timeout=5)
        r.raise_for_status()
    except Exception as e:
        print(f'❌ Cannot reach Payload API at {BASE_URL}')
        print(f'   Make sure dev server is running: cd frontend && npm run dev')
        sys.exit(1)

    login()

    category_map = {}  # slug -> id
    brand_map = {}     # slug -> id

    # ── 1. CATEGORIES ──
    print('\n📁 Seeding categories...')
    categories_data = read_json('categories.json')
    cat_count = 0

    for cat in categories_data:
        existing = find_one('categories', 'slug', cat['slug'])
        if existing:
            parent_id = existing['id']
            print(f'  ⏭  "{cat["name"]}" exists')
        else:
            result, err = api('POST', 'categories', {
                'name': cat['name'],
                'slug': cat['slug'],
                'order': cat['order'],
                'isActive': True,
            })
            if err:
                print(f'  ⚠ Error creating "{cat["name"]}": {err}')
                continue
            parent_id = result['doc']['id']
            cat_count += 1

        category_map[cat['slug']] = parent_id

        # Children
        child_ids = []
        for child in cat.get('children', []):
            existing_child = find_one('categories', 'slug', child['slug'])
            if existing_child:
                child_id = existing_child['id']
            else:
                result, err = api('POST', 'categories', {
                    'name': child['name'],
                    'slug': child['slug'],
                    'order': child['order'],
                    'parentCategory': parent_id,
                    'isActive': True,
                })
                if err:
                    print(f'  ⚠ Error creating "{child["name"]}": {err}')
                    continue
                child_id = result['doc']['id']
                cat_count += 1

            category_map[child['slug']] = child_id
            child_ids.append(child_id)

        # Update parent with subcategories
        if child_ids:
            api('PATCH', f'categories/{parent_id}', {'subcategories': child_ids})

    print(f'  ✅ Categories: {cat_count} created, {len(category_map)} total')

    # ── 2. BRANDS ──
    print('\n🏷️  Seeding brands...')
    brands_data = read_json('brands.json')
    brand_count = 0

    for brand in brands_data:
        existing = find_one('brands', 'slug', brand['slug'])
        if existing:
            brand_map[brand['slug']] = existing['id']
            print(f'  ⏭  "{brand["name"]}" exists')
            continue

        result, err = api('POST', 'brands', {
            'name': brand['name'],
            'slug': brand['slug'],
            'shortDescription': brand['shortDescription'],
            'countryOfOrigin': brand['countryOfOrigin'],
            'foundedYear': brand['foundedYear'],
            'website': brand['website'],
            'accentColor': brand['accentColor'],
            'benefits': brand['benefits'],
            'order': brand_count,
            'isActive': True,
        })
        if err:
            print(f'  ⚠ Error creating "{brand["name"]}": {err}')
            continue
        brand_map[brand['slug']] = result['doc']['id']
        brand_count += 1

    print(f'  ✅ Brands: {brand_count} created')

    # ── 3. PRODUCTS ──
    print('\n📦 Seeding products...')
    product_files = [
        'products-elgon.json',
        'products-mood.json',
        'products-nevitaly.json',
        'products-inebrya.json',
    ]

    brand_display = {
        'elgon': 'Elgon',
        'mood': 'MOOD',
        'nevitaly': 'Nevitaly',
        'inebrya': 'Inebrya',
    }

    product_count = 0
    skip_count = 0
    error_count = 0

    for pfile in product_files:
        products = read_json(pfile)
        brand_name = pfile.replace('products-', '').replace('.json', '')
        print(f'  📦 {brand_name}: {len(products)} products...')

        for product in products:
            handle = slugify(product['title'])
            if not handle:
                continue

            # Check if exists
            existing = find_one('products', 'handle', handle)
            if existing:
                skip_count += 1
                continue

            cat_slug = product.get('category', 'doglyad-za-volossynam')
            cat_id = category_map.get(cat_slug)
            brand_id = brand_map.get(product['brand'])

            variant = {
                'title': product.get('volume') or 'Стандарт',
                'sku': product.get('articleCode') or None,
                'price': product.get('price') or 0,
                'inStock': product.get('inStock', True),
                'inventory': 10,
            }
            if product.get('costPrice'):
                variant['costPrice'] = product['costPrice']
            if product.get('supplierCode'):
                variant['supplierCode'] = product['supplierCode']
            if product.get('articleCode'):
                variant['articleCode'] = product['articleCode']

            data = {
                'title': product['title'],
                'handle': handle,
                'subtitle': brand_display.get(product['brand'], product['brand']),
                'variants': [variant],
                'status': 'active',
            }
            if cat_id:
                data['categories'] = [cat_id]
            if brand_id:
                data['brand'] = brand_id

            result, err = api('POST', 'products', data)
            if err:
                err_str = str(err)
                if 'duplicate' in err_str.lower() or 'unique' in err_str.lower():
                    skip_count += 1
                else:
                    error_count += 1
                    if error_count <= 5:
                        print(f'    ⚠ {product["title"][:50]}: {err_str[:100]}')
            else:
                product_count += 1
                if product_count % 100 == 0:
                    print(f'    ... {product_count} created')

    print(f'  ✅ Products: {product_count} created, {skip_count} skipped, {error_count} errors')

    # ── 4. BLOG POSTS ──
    print('\n📝 Seeding blog posts...')
    blog_posts = read_json('blog-posts.json')
    blog_count = 0

    for post in blog_posts:
        existing = find_one('blog-posts', 'slug', post['slug'])
        if existing:
            print(f'  ⏭  "{post["title"][:40]}..." exists')
            continue

        paragraphs = [p for p in post['content'].split('\n') if p.strip()]
        rich_text = {
            'root': {
                'type': 'root',
                'children': [
                    {
                        'type': 'paragraph',
                        'children': [{'type': 'text', 'text': text, 'version': 1}],
                        'version': 1,
                    }
                    for text in paragraphs
                ],
                'direction': None,
                'format': '',
                'indent': 0,
                'version': 1,
            }
        }

        result, err = api('POST', 'blog-posts', {
            'title': post['title'],
            'slug': post['slug'],
            'excerpt': post['excerpt'],
            'author': 'HAIR LAB',
            'tags': [{'tag': tag} for tag in post['tags']],
            'content': rich_text,
            'publishedAt': '2026-02-17T12:00:00.000Z',
            'status': 'published',
        })
        if err:
            print(f'  ⚠ Error: {post["title"][:40]}: {err}')
        else:
            blog_count += 1

    print(f'  ✅ Blog posts: {blog_count} created')

    # ── SUMMARY ──
    print('\n' + '=' * 60)
    print('  SEED COMPLETE')
    print('=' * 60)
    print(f'  Categories: {len(category_map)}')
    print(f'  Brands:     {len(brand_map)}')
    print(f'  Products:   {product_count}')
    print(f'  Blog posts: {blog_count}')
    print('=' * 60)


if __name__ == '__main__':
    main()
