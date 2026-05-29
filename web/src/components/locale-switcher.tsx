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
  const activeIndex = routing.locales.indexOf(locale);

  return (
    <div className="glass relative flex rounded-full p-1 shadow-glass" role="group" aria-label={t('label')}>
      {/* Sliding pill that glides under the active locale. */}
      <span
        aria-hidden
        className="bg-brand absolute inset-y-1 left-1 w-9 rounded-full shadow-glow transition-transform duration-300 ease-smooth"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {routing.locales.map((value) => (
        <button
          key={value}
          type="button"
          aria-label={t(value)}
          aria-pressed={value === locale}
          onClick={() => router.replace(pathname, { locale: value })}
          className={cn(
            'relative z-10 h-8 w-9 rounded-full text-xs font-bold transition-colors duration-300 ease-smooth',
            value === locale ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {shortLabels[value]}
        </button>
      ))}
    </div>
  );
}
