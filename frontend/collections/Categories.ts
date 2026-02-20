import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Категорія', plural: 'Категорії' },
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
    read: () => true,
    create: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    update: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    delete: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      maxLength: 200,
      localized: true,
    },
    {
      name: 'banner',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'accentColor',
      type: 'text',
      defaultValue: '#8B5CF6',
      validate: (val: string | null | undefined) => {
        if (val && !/^#[0-9A-Fa-f]{6}$/.test(val)) {
          return 'Must be a valid hex color (e.g. #8B5CF6)'
        }
        return true
      },
    },
    {
      name: 'subcategories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'parentCategory',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'promoBlock',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'link',
          type: 'text',
        },
        {
          name: 'buttonText',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          maxLength: 60,
          localized: true,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
          localized: true,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
