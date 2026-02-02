import type { Core } from '@strapi/strapi';

// Categories to seed
const CATEGORIES = [
  {
    name: 'Шампуні',
    slug: 'shampoos',
    medusaHandle: 'shampoos',
    shortDescription: 'Професійні шампуні для всіх типів волосся',
    accentColor: '#3B82F6',
    order: 1,
  },
  {
    name: 'Кондиціонери',
    slug: 'conditioners',
    medusaHandle: 'conditioners',
    shortDescription: 'Кондиціонери та бальзами для волосся',
    accentColor: '#8B5CF6',
    order: 2,
  },
  {
    name: 'Маски',
    slug: 'masks',
    medusaHandle: 'masks',
    shortDescription: 'Інтенсивні маски для відновлення волосся',
    accentColor: '#EC4899',
    order: 3,
  },
  {
    name: 'Сироватки та флюїди',
    slug: 'serums',
    medusaHandle: 'serums',
    shortDescription: 'Сироватки, флюїди та олії для волосся',
    accentColor: '#F59E0B',
    order: 4,
  },
  {
    name: 'Спреї',
    slug: 'sprays',
    medusaHandle: 'sprays',
    shortDescription: 'Спреї для догляду та захисту волосся',
    accentColor: '#10B981',
    order: 5,
  },
  {
    name: 'Стайлінг',
    slug: 'styling',
    medusaHandle: 'styling',
    shortDescription: 'Засоби для укладання волосся',
    accentColor: '#6366F1',
    order: 6,
  },
  {
    name: 'Фарби для волосся',
    slug: 'hair-color',
    medusaHandle: 'hair-color',
    shortDescription: 'Професійні фарби та засоби для фарбування',
    accentColor: '#EF4444',
    order: 7,
  },
  {
    name: 'Аксесуари',
    slug: 'accessories',
    medusaHandle: 'accessories',
    shortDescription: 'Аксесуари для догляду та укладання волосся',
    accentColor: '#14B8A6',
    order: 8,
  },
];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Set up public permissions for Category
    await setupPermissions(strapi);

    // Seed categories
    await seedCategories(strapi);
  },
};

async function setupPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    console.log('Public role not found, skipping permissions setup');
    return;
  }

  // Check if category permissions already exist
  const existingPermissions = await strapi
    .query('plugin::users-permissions.permission')
    .findMany({
      where: {
        role: publicRole.id,
        action: { $startsWith: 'api::category' },
      },
    });

  if (existingPermissions.length > 0) {
    console.log('Category permissions already configured');
    return;
  }

  // Create find and findOne permissions for Category
  const actions = ['api::category.category.find', 'api::category.category.findOne'];

  for (const action of actions) {
    await strapi.query('plugin::users-permissions.permission').create({
      data: {
        action,
        role: publicRole.id,
      },
    });
  }

  console.log('✅ Category public permissions configured');
}

async function seedCategories(strapi: Core.Strapi) {
  // Check if categories already exist
  const existingCount = await strapi.query('api::category.category').count();

  if (existingCount > 0) {
    console.log(`Categories already seeded (${existingCount} found)`);
    return;
  }

  console.log('🌱 Seeding categories...');

  for (const category of CATEGORIES) {
    try {
      await strapi.query('api::category.category').create({
        data: {
          ...category,
          isActive: true,
          publishedAt: new Date(),
        },
      });
      console.log(`  ✅ Created category: ${category.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${category.name}:`, error);
    }
  }

  console.log('✅ Categories seeded successfully');
}
