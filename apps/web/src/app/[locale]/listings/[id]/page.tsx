import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ListingGallery } from '@/components/listing-gallery';
import { getListingById } from '@/lib/data/listings';
import { getCurrentUser } from '@/lib/session';
import { formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

type ListingPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  return { title: listing?.title ?? 'The Spot' };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { locale, id } = await params;
  const listing = await getListingById(id);

  // Hide unpublished listings from everyone except their owner.
  const user = await getCurrentUser();
  if (!listing || (listing.status !== 'PUBLISHED' && listing.owner.id !== user?.id)) {
    notFound();
  }

  const t = await getTranslations('Listing');
  const tRoles = await getTranslations('Roles');

  const specs = [
    { label: t('rooms'), value: String(listing.rooms) },
    listing.areaSqm ? { label: t('area'), value: `${listing.areaSqm} ${t('areaUnit')}` } : null,
    listing.floor ? { label: t('floor'), value: String(listing.floor) } : null,
    { label: t('type'), value: t(`types.${listing.type}`) },
  ].filter((spec): spec is { label: string; value: string } => spec !== null);

  return (
    <section className="container max-w-5xl py-10 sm:py-14">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('back')}
      </Link>

      <div className="animate-fade-up">
        <ListingGallery images={listing.images} title={listing.title} />
      </div>

      <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-[1fr_320px]">
        <div className="animate-fade-up min-w-0" style={{ animationDelay: '60ms' }}>
          {listing.district || listing.address || listing.city ? (
            <p className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {[
                listing.district ? `${listing.district} ${t('districtSuffix')}` : null,
                [listing.city, listing.address].filter(Boolean).join(', ') || null,
              ]
                .filter(Boolean)
                .join(' - ')}
            </p>
          ) : null}
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{listing.title}</h1>
          <p className="mt-3 text-2xl font-semibold">
            {formatPrice(listing.price, listing.currency, locale)}
            <span className="text-muted-foreground text-base font-normal">{t('perMonth')}</span>
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {specs.map((spec) => (
              <div key={spec.label} className="surface rounded-2xl p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-wide">{spec.label}</p>
                <p className="mt-1 font-semibold">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="surface flex h-full flex-col rounded-3xl p-6">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              {t('owner')}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold">
                {getInitials(listing.owner.fullName)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{listing.owner.fullName}</p>
                <p className="text-muted-foreground text-sm">{tRoles(listing.owner.role)}</p>
              </div>
            </div>

            {listing.owner.phone ? (
              <a
                href={`tel:${listing.owner.phone}`}
                className="bg-primary text-primary-foreground ease-smooth mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 hover:opacity-90"
              >
                <Phone className="h-4 w-4" aria-hidden />
                {listing.owner.phone}
              </a>
            ) : null}
          </div>
        </aside>
      </div>

      <div className="mt-8 max-w-3xl">
        <h2 className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {t('description')}
        </h2>
        <p className="mt-2 whitespace-pre-line leading-relaxed">{listing.description}</p>
      </div>
    </section>
  );
}
