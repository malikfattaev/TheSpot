import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ListingCard } from '@/components/listing-card';
import { ListingsFilter } from '@/components/listings-filter';
import { SearchBar } from '@/components/search-bar';
import { getFavoriteListingIds, getPublishedListings } from '@/lib/data/listings';
import { getCurrentUser } from '@/lib/session';
import { isCurrency, isDistrictKey, isRentPeriod } from '@/lib/listing-options';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

type HomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toPositiveInt(value: string | string[] | undefined): number | undefined {
  const parsed = Number(firstValue(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Nav' });
  // The home page shares the `[locale]` segment with the layout, so the
  // layout's title template doesn't apply here — build the full title.
  return { title: { absolute: `The Spot | ${t('home')}` } };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const t = await getTranslations('Home');

  const sp = await searchParams;
  const district = firstValue(sp.district);
  const currency = firstValue(sp.currency);
  const rentPeriod = firstValue(sp.rentPeriod);
  const user = await getCurrentUser();
  const [listings, favoriteIds] = await Promise.all([
    getPublishedListings({
      rooms: toPositiveInt(sp.rooms),
      district: isDistrictKey(district) ? district : undefined,
      maxPrice: toPositiveInt(sp.maxPrice),
      currency: isCurrency(currency) ? currency : undefined,
      rentPeriod: isRentPeriod(rentPeriod) ? rentPeriod : undefined,
    }),
    getFavoriteListingIds(user?.id ?? null),
  ]);

  return (
    <section className="container py-10 sm:py-14">
      <div className="animate-fade-up">
        <SearchBar />
      </div>

      <div
        className="animate-fade-up relative z-20 mt-12 flex flex-wrap items-center justify-between gap-3"
        style={{ animationDelay: '80ms' }}
      >
        <h2 className="text-xl font-semibold tracking-tight">{t('title')}</h2>
        <ListingsFilter />
      </div>

      {listings.length === 0 ? (
        <div
          className="surface animate-fade-up text-muted-foreground mt-6 rounded-3xl p-12 text-center"
          style={{ animationDelay: '120ms' }}
        >
          {t('empty')}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <ListingCard listing={listing} favorited={favoriteIds.has(listing.id)} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
