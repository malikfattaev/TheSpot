'use client';

import { type FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { CURRENCY_OPTIONS, DISTRICT_KEYS, ROOM_OPTIONS } from '@/lib/listing-options';
import { Button } from './ui/button';

const fieldClass =
  'h-12 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground';

export function SearchBar() {
  const t = useTranslations('Search');
  const tDistricts = useTranslations('Districts');
  const router = useRouter();
  const [district, setDistrict] = useState('');
  const [rooms, setRooms] = useState('');
  const [currency, setCurrency] = useState<string>('UZS');
  const [maxPrice, setMaxPrice] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (district) params.set('district', district);
    if (rooms) params.set('rooms', rooms);
    // Currency only matters as a constraint when a price ceiling is set.
    if (maxPrice) {
      params.set('maxPrice', maxPrice);
      if (currency) params.set('currency', currency);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : '/');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface shadow-soft flex flex-col gap-2 rounded-3xl p-2 sm:flex-row sm:items-center sm:rounded-full"
    >
      <select
        value={district}
        onChange={(event) => setDistrict(event.target.value)}
        aria-label={t('district')}
        className={`${fieldClass} flex-1 rounded-full ${district ? '' : 'text-muted-foreground'}`}
      >
        <option value="">{t('anyDistrict')}</option>
        {DISTRICT_KEYS.map((key) => (
          <option key={key} value={key}>
            {tDistricts(key)}
          </option>
        ))}
      </select>
      <div className="bg-border hidden h-6 w-px sm:block" />
      <select
        value={rooms}
        onChange={(event) => setRooms(event.target.value)}
        aria-label={t('rooms')}
        className={`${fieldClass} rounded-full ${rooms ? '' : 'text-muted-foreground'}`}
      >
        <option value="">{t('anyRooms')}</option>
        {ROOM_OPTIONS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <div className="bg-border hidden h-6 w-px sm:block" />
      <input
        value={maxPrice}
        onChange={(event) => setMaxPrice(event.target.value)}
        type="number"
        inputMode="numeric"
        min={0}
        placeholder={t('price')}
        aria-label={t('price')}
        className={`${fieldClass} rounded-full sm:w-32`}
      />
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value)}
        aria-label={t('currency')}
        className={`${fieldClass} rounded-full ${currency ? '' : 'text-muted-foreground'}`}
      >
        <option value="">{t('anyCurrency')}</option>
        {CURRENCY_OPTIONS.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <Button type="submit" className="shrink-0">
        <Search className="h-4 w-4" aria-hidden />
        {t('submit')}
      </Button>
    </form>
  );
}
