import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { ListingCardData } from '@/lib/data/listings';
import { formatPrice } from '@/lib/format';
import { mediaSrc } from '@/lib/media';
import { FavoriteButton } from './favorite-button';

export function ListingCard({
  listing,
  favorited = false,
  refreshFavoriteOnToggle = false,
}: {
  listing: ListingCardData;
  favorited?: boolean;
  /** On the favorites page, refresh after un-saving so the card drops out. */
  refreshFavoriteOnToggle?: boolean;
}) {
  const t = useTranslations('ListingCard');
  const tDistricts = useTranslations('Districts');
  const locale = useLocale();

  const districtLabel =
    listing.district && tDistricts.has(listing.district)
      ? tDistricts(listing.district)
      : listing.district;

  const specs = [
    t('rooms', { count: listing.rooms }),
    listing.areaSqm ? `${listing.areaSqm} ${t('areaUnit')}` : null,
    listing.floor ? t('floor', { floor: listing.floor }) : null,
  ].filter(Boolean);

  return (
    <div className="group relative">
      <Link
        href={`/listings/${listing.id}`}
        className="surface ease-smooth group-hover:shadow-soft flex flex-col overflow-hidden rounded-3xl transition-all duration-300 group-hover:-translate-y-1"
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
          {districtLabel ? (
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {districtLabel} {t('districtSuffix')}
            </p>
          ) : null}
          <h3 className="mt-1 line-clamp-1 font-medium">{listing.title}</h3>
          <p className="text-muted-foreground mt-1 text-sm">{specs.join(' · ')}</p>
          <p className="mt-3 text-lg font-semibold">
            {formatPrice(listing.price, listing.currency, locale)}
            <span className="text-muted-foreground text-sm font-normal">
              {listing.rentPeriod === 'DAILY' ? t('perDay') : t('perMonth')}
            </span>
          </p>
        </div>
      </Link>

      <FavoriteButton
        listingId={listing.id}
        initialFavorited={favorited}
        refreshOnToggle={refreshFavoriteOnToggle}
        className="absolute right-3 top-3 z-10"
      />
    </div>
  );
}
