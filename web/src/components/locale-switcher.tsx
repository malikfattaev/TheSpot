'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const shortLabels: Record<Locale, string> = {
  ru: 'RU',
  uz: 'UZ',
};

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-sm" role="group" aria-label={t('label')}>
      {routing.locales.map((value, index) => (
        <div key={value} className="flex items-center">
          {index > 0 && <span className="px-1 text-foreground/25">/</span>}
          <button
            type="button"
            aria-label={t(value)}
            aria-pressed={value === locale}
            onClick={() => router.replace(pathname, { locale: value })}
            className={cn(
              'transition-colors duration-300 ease-smooth',
              value === locale
                ? 'font-semibold text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {shortLabels[value]}
          </button>
        </div>
      ))}
    </div>
  );
}
