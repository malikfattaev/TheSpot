'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  function selectLocale(value: Locale) {
    setOpen(false);
    if (value !== locale) {
      router.replace(pathname, { locale: value });
    }
  }

  const others = routing.locales.filter((value) => value !== locale);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('label')}
        onClick={() => setOpen((value) => !value)}
        className="text-foreground ease-smooth hover:bg-foreground/5 flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold transition-colors duration-300"
      >
        {shortLabels[locale]}
        <ChevronDown
          className={cn(
            'text-muted-foreground ease-smooth h-4 w-4 transition-transform duration-300',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('label')}
          className="animate-fade-in border-border bg-card absolute left-1/2 z-50 mt-2 w-24 origin-top -translate-x-1/2 rounded-2xl border p-1.5 shadow-xl"
        >
          {others.map((value) => (
            <button
              key={value}
              type="button"
              role="menuitem"
              aria-label={t(value)}
              onClick={() => selectLocale(value)}
              className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200"
            >
              {shortLabels[value]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
