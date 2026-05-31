import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { ListingCardData } from '@/lib/data/listings';
import { formatPrice } from '@/lib/format';
import { mediaSrc } from '@/lib/media';

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const t = useTranslations('ListingCard');
  const locale = useLocale();

  const specs = [
    t('rooms', { count: listing.rooms }),
    listing.areaSqm ? `${listing.areaSqm} ${t('areaUnit')}` : null,
    listing.floor ? t('floor', { floor: listing.floor }) : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="surface ease-smooth hover:shadow-soft group flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="from-secondary to-accent aspect-[4/3] w-full overflow-hidden bg-gradient-to-br">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaSrc(listing.imageUrl)}
            alt={listing.title}
            className="ease-smooth h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {listing.district ? (
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {listing.district} {t('districtSuffix')}
          </p>
        ) : null}
        <h3 className="mt-1 line-clamp-1 font-medium">{listing.title}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{specs.join(' · ')}</p>
        <p className="mt-3 text-lg font-semibold">
          {formatPrice(listing.price, listing.currency, locale)}
          <span className="text-muted-foreground text-sm font-normal">{t('perMonth')}</span>
        </p>
      </div>
    </Link>
  );
}
