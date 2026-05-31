'use client';

import { type FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import {
  CURRENCY_OPTIONS,
  DISTRICT_KEYS,
  RENT_PERIOD_OPTIONS,
  ROOM_OPTIONS,
} from '@/lib/listing-options';
import { Button } from './ui/button';

const fieldClass =
  'h-12 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground';

export function SearchBar() {
  const t = useTranslations('Search');
  const tDistricts = useTranslations('Districts');
  const tPeriods = useTranslations('ListingForm.rentPeriods');
  const router = useRouter();
  const [district, setDistrict] = useState('');
  const [rooms, setRooms] = useState('');
  const [rentPeriod, setRentPeriod] = useState('');
  const [currency, setCurrency] = useState<string>('UZS');
  const [maxPrice, setMaxPrice] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (district) params.set('district', district);
    if (rooms) params.set('rooms', rooms);
    if (rentPeriod) params.set('rentPeriod', rentPeriod);
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
      className="surface shadow-soft grid grid-cols-2 gap-2 rounded-3xl p-2 sm:flex sm:flex-row sm:items-center sm:rounded-full"
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
      <select
        value={rentPeriod}
        onChange={(event) => setRentPeriod(event.target.value)}
        aria-label={t('rentPeriod')}
        className={`${fieldClass} rounded-full ${rentPeriod ? '' : 'text-muted-foreground'}`}
      >
        <option value="">{t('anyPeriod')}</option>
        {RENT_PERIOD_OPTIONS.map((period) => (
          <option key={period} value={period}>
            {tPeriods(period)}
          </option>
        ))}
      </select>
      <div className="bg-border hidden h-6 w-px sm:block" />
      <div className="flex items-center sm:w-44">
        <input
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          type="number"
          inputMode="numeric"
          min={0}
          placeholder={t('price')}
          aria-label={t('price')}
          className={`${fieldClass} no-spinner min-w-0 flex-1 rounded-l-full pr-1`}
        />
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          aria-label={t('currency')}
          className="text-muted-foreground hover:text-foreground ease-smooth h-9 cursor-pointer appearance-none rounded-full bg-transparent px-2 text-sm font-medium outline-none transition-colors duration-200"
        >
          {CURRENCY_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" className="col-span-2 h-12 w-full sm:h-11 sm:w-auto sm:shrink-0">
        <Search className="h-4 w-4" aria-hidden />
        {t('submit')}
      </Button>
    </form>
  );
}
