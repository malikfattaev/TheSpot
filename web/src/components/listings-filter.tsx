'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const ROOM_OPTIONS = [1, 2, 3, 4] as const;

const fieldClass =
  'h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors duration-200 focus:border-foreground/30';

export function ListingsFilter() {
  const t = useTranslations('Search');
  const tf = useTranslations('Filter');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [rooms, setRooms] = useState(searchParams.get('rooms') ?? '');
  const [district, setDistrict] = useState(searchParams.get('district') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  const activeCount = ['rooms', 'district', 'maxPrice'].filter((key) =>
    searchParams.get(key),
  ).length;

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

  function apply() {
    const params = new URLSearchParams();
    if (rooms) params.set('rooms', rooms);
    if (district.trim()) params.set('district', district.trim());
    if (maxPrice) params.set('maxPrice', maxPrice);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  }

  function reset() {
    setRooms('');
    setDistrict('');
    setMaxPrice('');
    router.replace(pathname);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-2 rounded-full border border-foreground/15 bg-card/50 px-4 py-2 text-sm font-medium transition-colors duration-300 ease-smooth hover:bg-card/80',
          (open || activeCount > 0) && 'border-foreground/30',
        )}
      >
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden />
        {tf('title')}
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-300 ease-smooth',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={tf('title')}
          className="animate-fade-in absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-2xl border border-border bg-card p-4 shadow-xl"
        >
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{t('rooms')}</span>
              <select
                value={rooms}
                onChange={(event) => setRooms(event.target.value)}
                className={cn(fieldClass, 'appearance-none')}
              >
                <option value="">{t('anyRooms')}</option>
                {ROOM_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}+
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{t('district')}</span>
              <input
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && apply()}
                placeholder={t('district')}
                className={fieldClass}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{t('price')}</span>
              <input
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && apply()}
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={t('price')}
                className={fieldClass}
              />
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {tf('reset')}
            </button>
            <button
              type="button"
              onClick={apply}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              {tf('apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
