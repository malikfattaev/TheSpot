import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { canPublishListings } from '@thespot/db/roles';
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

  const t = await getTranslations();

  return (
    <section className="container py-20">
      <h1 className="animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">
        {t('Profile.myListings')}
      </h1>
      <div className="surface animate-fade-up text-muted-foreground mt-8 rounded-3xl p-12 text-center">
        {t('Home.empty')}
      </div>
    </section>
  );
}
