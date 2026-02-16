import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'status', 'updatedAt'],
    group: 'Shop',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'handle', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
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
        { name: 'compareAtPrice', type: 'number', min: 0, admin: { description: 'Original price before discount' } },
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
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
