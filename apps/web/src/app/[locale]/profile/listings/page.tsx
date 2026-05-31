import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { canPublishListings } from '@thespot/db/roles';
import { Link } from '@/i18n/navigation';
import { OwnerListingCard } from '@/components/owner-listing-card';
import { buttonVariants } from '@/components/ui/button';
import { getListingsByOwner } from '@/lib/data/listings';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

type ProfileListingsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ProfileListingsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Profile' });
  return { title: t('myListings') };
}

export default async function ProfileListingsPage({ params }: ProfileListingsPageProps) {
  const { locale } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (!canPublishListings(user.role)) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations('Profile');
  const listings = await getListingsByOwner(user.id);

  return (
    <section className="container max-w-4xl py-12 sm:py-16">
      <div className="animate-fade-up flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('myListings')}</h1>
        <Link href="/listings/new" className={buttonVariants({ size: 'md' })}>
          <Plus className="h-4 w-4" aria-hidden />
          {t('addListing')}
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="surface animate-fade-up mt-8 rounded-3xl p-12 text-center">
          <p className="text-muted-foreground">{t('noListings')}</p>
          <Link
            href="/listings/new"
            className={`${buttonVariants({ size: 'md' })} mt-5`}
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('addFirstListing')}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <OwnerListingCard listing={listing} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
