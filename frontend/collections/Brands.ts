import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'
import { invalidateChatCache } from '@/lib/chat/product-context-cache'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Бренд', plural: 'Бренди' },
  hooks: {
    afterChange: [({ doc }) => { invalidateChatCache(); return doc }],
    afterDelete: [({ doc }) => { invalidateChatCache(); return doc }],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'countryOfOrigin', 'isActive'],
    group: 'Каталог',
    components: {
      views: {
        list: {
          Component: '/components/payload/views/custom-list',
        },
        edit: {
          root: {
            Component: '/components/payload/views/custom-edit',
          },
        },
      },
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return true
      return collectionAccess('brands', 'read')({ req: { user } } as any)
    },
    create: collectionAccess('brands', 'create'),
    update: collectionAccess('brands', 'update'),
    delete: collectionAccess('brands', 'delete'),
  },
  fields: [
    // ── Основна інформація (завжди видима) ──
    {
      name: 'name',
      label: 'Назва',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      label: 'URL (slug)',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'shortDescription',
      label: 'Короткий опис',
      type: 'textarea',
      maxLength: 300,
      localized: true,
    },
    {
      name: 'order',
      label: 'Порядок сортування',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'isActive',
      label: 'Активний',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    // ── Tabs для решти контенту ──
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Опис та історія',
          fields: [
            {
              name: 'description',
              label: 'Повний опис',
              type: 'richText',
              localized: true,
            },
            {
              name: 'history',
              label: 'Історія бренду',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Медіа',
          fields: [
            {
              name: 'logo',
              label: 'Логотип',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'banner',
              label: 'Банер',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'accentColor',
              label: 'Акцентний колір',
              type: 'text',
              defaultValue: '#8B5CF6',
              admin: { description: 'HEX колір, наприклад #8B5CF6' },
              validate: (val: string | null | undefined) => {
                if (val && !/^#[0-9A-Fa-f]{6}$/.test(val)) {
                  return 'Має бути валідний HEX колір (наприклад #8B5CF6)'
                }
                return true
              },
            },
          ],
        },
        {
          label: 'Деталі',
          fields: [
            {
              name: 'countryOfOrigin',
              label: 'Країна виробника',
              type: 'text',
            },
            {
              name: 'foundedYear',
              label: 'Рік заснування',
              type: 'number',
            },
            {
              name: 'website',
              label: 'Вебсайт',
              type: 'text',
            },
          ],
        },
        {
          label: 'Переваги',
          fields: [
            {
              name: 'benefits',
              label: 'Переваги бренду',
              type: 'array',
              admin: {
                initCollapsed: true,
                description: 'Ключові переваги що відображаються на сторінці бренду',
              },
              fields: [
                {
                  name: 'icon',
                  label: 'Іконка',
                  type: 'text',
                  required: true,
                  defaultValue: '\u2728',
                },
                {
                  name: 'title',
                  label: 'Заголовок',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'description',
                  label: 'Опис',
                  type: 'textarea',
                  maxLength: 300,
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              label: 'SEO налаштування',
              type: 'group',
              fields: [
                {
                  name: 'metaTitle',
                  label: 'SEO заголовок',
                  type: 'text',
                  maxLength: 60,
                  admin: { description: 'До 60 символів' },
                },
                {
                  name: 'metaDescription',
                  label: 'SEO опис',
                  type: 'textarea',
                  maxLength: 160,
                  admin: { description: 'До 160 символів' },
                },
                {
                  name: 'ogImage',
                  label: 'OG зображення',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
