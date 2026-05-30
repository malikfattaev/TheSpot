'use client';

import { type FormEvent, useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from './ui/button';

const ROOM_OPTIONS = [1, 2, 3, 4] as const;

const fieldClass =
  'h-12 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground';

export function SearchBar() {
  const t = useTranslations('Search');
  const router = useRouter();
  const [district, setDistrict] = useState('');
  const [rooms, setRooms] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (district.trim()) params.set('district', district.trim());
    if (rooms) params.set('rooms', rooms);
    if (maxPrice) params.set('maxPrice', maxPrice);
    const query = params.toString();
    router.push(query ? `/listings?${query}` : '/listings');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface shadow-soft flex flex-col gap-2 rounded-3xl p-2 sm:flex-row sm:items-center sm:rounded-full"
    >
      <input
        value={district}
        onChange={(event) => setDistrict(event.target.value)}
        placeholder={t('district')}
        aria-label={t('district')}
        className={`${fieldClass} flex-1 rounded-full`}
      />
      <div className="bg-border hidden h-6 w-px sm:block" />
      <select
        value={rooms}
        onChange={(event) => setRooms(event.target.value)}
        aria-label={t('rooms')}
        className={`${fieldClass} text-muted-foreground rounded-full`}
      >
        <option value="">{t('anyRooms')}</option>
        {ROOM_OPTIONS.map((value) => (
          <option key={value} value={value}>
            {value}+
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
        className={`${fieldClass} rounded-full sm:w-36`}
      />
      <Button type="submit" className="shrink-0">
        <Search className="h-4 w-4" aria-hidden />
        {t('submit')}
      </Button>
    </form>
  );
}
