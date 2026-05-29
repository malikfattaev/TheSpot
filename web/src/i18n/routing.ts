import { defineRouting } from 'next-intl/routing';

/**
 * Russian is the primary language; Uzbek is the secondary. The default locale
 * is served without a prefix is *not* used here — every locale is prefixed so
 * URLs are unambiguous and shareable (`/ru/...`, `/uz/...`).
 */
export const routing = defineRouting({
  locales: ['ru', 'uz'],
  defaultLocale: 'ru',
});

export type Locale = (typeof routing.locales)[number];
