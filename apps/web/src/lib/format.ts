const PRICE_LOCALES: Record<string, string> = {
  ru: 'ru-RU',
  uz: 'uz-UZ',
};

/** Format a rent price with the right currency and locale grouping. */
export function formatPrice(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(PRICE_LOCALES[locale] ?? 'ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
