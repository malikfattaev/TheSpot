/**
 * Shared, closed sets of listing values. Both the publish/edit form and the
 * search filters import these so the options always match — and so a stored
 * district is a stable key the filter can match exactly (not free text).
 *
 * Districts are keys; their display names live in the `Districts` i18n
 * namespace (ru/uz). The DB stores the key.
 */

export const ROOM_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const MAX_ROOMS = 10;

export const DISTRICT_KEYS = [
  'bektemir',
  'chilanzar',
  'mirabad',
  'mirzoulugbek',
  'olmazor',
  'sergeli',
  'shaykhantakhur',
  'uchtepa',
  'yakkasaray',
  'yangihayot',
  'yashnabad',
  'yunusabad',
] as const;

export type DistrictKey = (typeof DISTRICT_KEYS)[number];

export const CURRENCY_OPTIONS = ['UZS', 'USD'] as const;
export type CurrencyOption = (typeof CURRENCY_OPTIONS)[number];

export const RENT_PERIOD_OPTIONS = ['MONTHLY', 'DAILY'] as const;
export type RentPeriodOption = (typeof RENT_PERIOD_OPTIONS)[number];

export function isRentPeriod(value: string | null | undefined): value is RentPeriodOption {
  return value === 'MONTHLY' || value === 'DAILY';
}

export function isDistrictKey(value: string | null | undefined): value is DistrictKey {
  return !!value && (DISTRICT_KEYS as readonly string[]).includes(value);
}

export function isCurrency(value: string | null | undefined): value is CurrencyOption {
  return value === 'UZS' || value === 'USD';
}
