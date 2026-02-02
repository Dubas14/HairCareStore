import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['uk'],
    translations: {
      uk: {
        'app.components.LeftMenu.navbrand.title': 'HAIR LAB',
        'app.components.LeftMenu.navbrand.workplace': 'Адмін панель',
        'Auth.form.welcome.title': 'Ласкаво просимо!',
        'Auth.form.welcome.subtitle': 'Увійдіть до вашого акаунту',
      },
    },
  },
  bootstrap(app: StrapiApp) {
    // Custom bootstrap logic
  },
};
