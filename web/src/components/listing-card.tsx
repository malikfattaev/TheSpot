import { useLocale, useTranslations } from 'next-intl';
import type { ListingCardData } from '@/lib/data/listings';
import { formatPrice } from '@/lib/format';

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const t = useTranslations('ListingCard');
  const locale = useLocale();

  return (
    <article className="surface overflow-hidden rounded-3xl transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-soft active:scale-[1.02]">
      <div
        className="aspect-[4/3] w-full bg-gradient-to-br from-secondary to-accent"
        style={
          listing.imageUrl
            ? {
                backgroundImage: `url(${listing.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      />
      <div className="p-4">
        <p className="text-lg font-semibold">
          {formatPrice(listing.price, listing.currency, locale)}
          <span className="text-sm font-normal text-muted-foreground">{t('perMonth')}</span>
        </p>
        <h3 className="mt-1 line-clamp-1 font-medium">{listing.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('rooms', { count: listing.rooms })} · {listing.city}
        </p>
      </div>
    </article>
  );
}
