'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label={t('label')}
      value={locale}
      onChange={(event) => router.replace(pathname, { locale: event.target.value as Locale })}
      className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
    >
      {routing.locales.map((value) => (
        <option key={value} value={value}>
          {t(value)}
        </option>
      ))}
    </select>
  );
}
