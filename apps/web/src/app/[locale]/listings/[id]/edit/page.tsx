import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { canPublishListings } from '@thespot/db/roles';
import { Link } from '@/i18n/navigation';
import { ListingForm, type ListingFormInitial } from '@/components/listing-form';
import { getListingById } from '@/lib/data/listings';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

type EditListingPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: EditListingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'EditListing' });
  return { title: t('title') };
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { locale, id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (!canPublishListings(user.role)) {
    redirect(`/${locale}`);
  }

  const listing = await getListingById(id);
  if (!listing) {
    notFound();
  }
  if (listing.owner.id !== user.id) {
    redirect(`/${locale}/profile/listings`);
  }

  const t = await getTranslations('EditListing');

  const initial: ListingFormInitial = {
    title: listing.title,
    description: listing.description,
    type: listing.type,
    rooms: String(listing.rooms),
    areaSqm: listing.areaSqm != null ? String(listing.areaSqm) : '',
    floor: listing.floor != null ? String(listing.floor) : '',
    city: listing.city,
    district: listing.district ?? '',
    address: listing.address ?? '',
    price: String(listing.price),
    currency: listing.currency,
    rentPeriod: listing.rentPeriod,
    publish: listing.status === 'PUBLISHED',
    imageUrls: listing.images.map((image) => image.url),
  };

  return (
    <section className="container max-w-3xl py-12 sm:py-16">
      <Link
        href="/profile/listings"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('back')}
      </Link>

      <h1 className="animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>

      <div className="animate-fade-up mt-8" style={{ animationDelay: '80ms' }}>
        <ListingForm locale={locale} mode="edit" listingId={listing.id} initial={initial} />
      </div>
    </section>
  );
}
