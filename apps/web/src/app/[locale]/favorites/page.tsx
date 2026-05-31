import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ListingCard } from '@/components/listing-card';
import { getFavoriteListings } from '@/lib/data/listings';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

type FavoritesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: FavoritesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Favorites' });
  return { title: t('title') };
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { locale } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations('Favorites');
  const listings = await getFavoriteListings(user.id);

  return (
    <section className="container py-12 sm:py-16">
      <h1 className="animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>

      {listings.length === 0 ? (
        <div className="surface animate-fade-up text-muted-foreground mt-8 rounded-3xl p-12 text-center">
          {t('empty')}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <ListingCard listing={listing} favorited refreshFavoriteOnToggle />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
