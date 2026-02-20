import type { CollectionConfig } from 'payload'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Бренд', plural: 'Бренди' },
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
      maxLength: 300,
      localized: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'banner',
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
      name: 'history',
      type: 'richText',
      localized: true,
    },
    {
      name: 'countryOfOrigin',
      type: 'text',
    },
    {
      name: 'foundedYear',
      type: 'number',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'benefits',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'text',
          required: true,
          defaultValue: '\u2728',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 300,
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
