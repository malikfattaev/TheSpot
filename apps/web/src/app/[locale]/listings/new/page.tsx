import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { canPublishListings } from '@thespot/db/roles';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { ListingForm } from '@/components/listing-form';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

type NewListingPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: NewListingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PostListing' });
  return { title: t('title') };
}

export default async function NewListingPage({ params }: NewListingPageProps) {
  const { locale } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (!canPublishListings(user.role)) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations('PostListing');

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
      <p className="text-muted-foreground animate-fade-up mt-2">{t('createSubtitle')}</p>

      <div className="animate-fade-up mt-8" style={{ animationDelay: '80ms' }}>
        <ListingForm locale={locale} mode="create" />
      </div>
    </section>
  );
}
