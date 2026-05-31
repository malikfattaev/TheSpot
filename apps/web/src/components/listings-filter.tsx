'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { CURRENCY_OPTIONS, DISTRICT_KEYS, ROOM_OPTIONS } from '@/lib/listing-options';
import { cn } from '@/lib/utils';

const fieldClass =
  'h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors duration-200 focus:border-foreground/30';

export function ListingsFilter() {
  const t = useTranslations('Search');
  const tf = useTranslations('Filter');
  const tDistricts = useTranslations('Districts');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [rooms, setRooms] = useState(searchParams.get('rooms') ?? '');
  const [district, setDistrict] = useState(searchParams.get('district') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const [currency, setCurrency] = useState(searchParams.get('currency') ?? 'UZS');

  const activeCount = ['rooms', 'district', 'maxPrice', 'currency'].filter((key) =>
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
    if (district) params.set('district', district);
    // Currency only matters as a constraint when a price ceiling is set.
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
      if (currency) params.set('currency', currency);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  }

  function reset() {
    setRooms('');
    setDistrict('');
    setMaxPrice('');
    setCurrency('UZS');
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
          'border-foreground/15 bg-card/50 ease-smooth hover:bg-card/80 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300',
          (open || activeCount > 0) && 'border-foreground/30',
        )}
      >
        <SlidersHorizontal className="text-muted-foreground h-4 w-4" aria-hidden />
        {tf('title')}
        {activeCount > 0 && (
          <span className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold">
            {activeCount}
          </span>
        )}
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
          role="dialog"
          aria-label={tf('title')}
          className="animate-fade-in border-border bg-card absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-2xl border p-4 shadow-xl"
        >
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-medium">{t('rooms')}</span>
              <select
                value={rooms}
                onChange={(event) => setRooms(event.target.value)}
                className={cn(fieldClass, 'appearance-none')}
              >
                <option value="">{t('anyRooms')}</option>
                {ROOM_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-medium">{t('district')}</span>
              <select
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                className={cn(fieldClass, 'appearance-none')}
              >
                <option value="">{t('anyDistrict')}</option>
                {DISTRICT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {tDistricts(key)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-medium">{t('price')}</span>
              <div className="border-border bg-background focus-within:border-foreground/30 flex h-11 items-center rounded-xl border transition-colors duration-200">
                <input
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && apply()}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder={t('price')}
                  className="no-spinner h-full min-w-0 flex-1 rounded-l-xl bg-transparent px-3 text-sm outline-none"
                />
                <select
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  aria-label={t('currency')}
                  className="border-border text-muted-foreground hover:text-foreground h-full cursor-pointer appearance-none rounded-r-xl border-l bg-transparent px-3 text-center text-sm font-medium outline-none transition-colors duration-200"
                >
                  {CURRENCY_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={reset}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200"
            >
              {tf('reset')}
            </button>
            <button
              type="button"
              onClick={apply}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200"
            >
              {tf('apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
