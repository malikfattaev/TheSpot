import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { canPublishListings } from '@thespot/db/roles';
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
    <section className="container py-20">
      <h1 className="animate-fade-up text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>
      <div className="surface animate-fade-up text-muted-foreground mt-8 max-w-xl rounded-3xl p-10">
        {t('subtitle')}
      </div>
    </section>
  );
}
