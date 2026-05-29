import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ListingCard } from '@/components/listing-card';
import { SearchBar } from '@/components/search-bar';
import { getPublishedListings } from '@/lib/data/listings';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const listings = await getPublishedListings();

  return (
    <section className="container py-10 sm:py-14">
      <div className="animate-fade-up">
        <SearchBar />
      </div>

      <h2
        className="animate-fade-up mt-12 text-xl font-semibold tracking-tight"
        style={{ animationDelay: '80ms' }}
      >
        {t('title')}
      </h2>

      {listings.length === 0 ? (
        <div
          className="surface animate-fade-up mt-6 rounded-3xl p-12 text-center text-muted-foreground"
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
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
