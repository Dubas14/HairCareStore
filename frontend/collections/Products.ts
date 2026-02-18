import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Товар', plural: 'Товари' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'status', 'updatedAt'],
    group: 'Магазин',
    components: {
      views: {
        list: {
          Component: '/components/payload/views/products/ProductsListView',
        },
        edit: {
          root: {
            Component: '/components/payload/views/products/ProductEditView',
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
    { name: 'title', type: 'text', required: true },
    { name: 'handle', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    {
      name: 'barcode',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Штрих-код (EAN-13/EAN-8). Унікальний ідентифікатор товару',
      },
    },
    { name: 'subtitle', type: 'text', admin: { description: 'Brand name or short tagline' } },
    { name: 'description', type: 'richText' },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    {
      name: 'images',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      name: 'variants',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'sku', type: 'text' },
        { name: 'price', type: 'number', required: true, min: 0, admin: { description: 'Price in UAH (major units)' } },
        { name: 'costPrice', type: 'number', min: 0, admin: { description: 'Ціна ходу/закупівлі (салонна ціна), грн' } },
        { name: 'compareAtPrice', type: 'number', min: 0, admin: { description: 'Original price before discount' } },
        { name: 'supplierCode', type: 'text', admin: { description: 'Код постачальника (напр. 000002145)' } },
        { name: 'articleCode', type: 'text', admin: { description: 'Артикул товару (напр. 510442)' } },
        { name: 'inStock', type: 'checkbox', defaultValue: true },
        { name: 'inventory', type: 'number', defaultValue: 0, min: 0 },
      ],
    },
    {
      name: 'options',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'values', type: 'array', fields: [{ name: 'value', type: 'text', required: true }] },
      ],
    },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'brand', type: 'relationship', relationTo: 'brands' },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Чернетка', value: 'draft' },
        { label: 'Активний', value: 'active' },
        { label: 'В архіві', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
