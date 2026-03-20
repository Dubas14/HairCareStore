import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'
import { invalidateChatCache } from '@/lib/chat/product-context-cache'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Категорія', plural: 'Категорії' },
  hooks: {
    afterChange: [({ doc }) => { invalidateChatCache(); return doc }],
    afterDelete: [({ doc }) => { invalidateChatCache(); return doc }],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', 'isActive'],
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
      return collectionAccess('categories', 'read')({ req: { user } } as any)
    },
    create: collectionAccess('categories', 'create'),
    update: collectionAccess('categories', 'update'),
    delete: collectionAccess('categories', 'delete'),
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
      maxLength: 200,
      localized: true,
    },
    {
      name: 'parentCategory',
      label: 'Батьківська категорія',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'subcategories',
      label: 'Підкатегорії',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
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
      label: 'Активна',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    // ── Tabs ──
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Опис',
          fields: [
            {
              name: 'description',
              label: 'Повний опис',
              type: 'richText',
              localized: true,
            },
          ],
        },
        {
          label: 'Медіа',
          fields: [
            { name: 'banner', label: 'Банер', type: 'upload', relationTo: 'media' },
            { name: 'icon', label: 'Іконка', type: 'upload', relationTo: 'media' },
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
          label: 'Промо-блок',
          fields: [
            {
              name: 'promoBlock',
              label: 'Налаштування промо-блоку',
              type: 'group',
              fields: [
                { name: 'title', label: 'Заголовок', type: 'text' },
                { name: 'description', label: 'Опис', type: 'textarea' },
                { name: 'image', label: 'Зображення', type: 'upload', relationTo: 'media' },
                { name: 'link', label: 'Посилання', type: 'text' },
                { name: 'buttonText', label: 'Текст кнопки', type: 'text' },
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
                { name: 'metaTitle', label: 'SEO заголовок', type: 'text', maxLength: 60, localized: true, admin: { description: 'До 60 символів' } },
                { name: 'metaDescription', label: 'SEO опис', type: 'textarea', maxLength: 160, localized: true, admin: { description: 'До 160 символів' } },
                { name: 'ogImage', label: 'OG зображення', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
