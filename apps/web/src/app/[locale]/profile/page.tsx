import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ProfileForm, type ProfileFormInitial } from '@/components/profile-form';
import { getProfile } from '@/lib/data/profile';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'EditProfile' });
  return { title: t('title') };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const t = await getTranslations('EditProfile');
  const profile = await getProfile(user.id);

  const initial: ProfileFormInitial = {
    fullName: profile?.fullName ?? user.fullName,
    phone: profile?.phone ?? user.phone ?? '',
    telegramUsername: profile?.telegramUsername ?? '',
  };

  return (
    <section className="container max-w-2xl py-12 sm:py-16">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('back')}
      </Link>

      <h1 className="animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>
      <p className="text-muted-foreground animate-fade-up mt-2">{t('subtitle')}</p>

      <div className="animate-fade-up mt-8" style={{ animationDelay: '80ms' }}>
        <ProfileForm initial={initial} />
      </div>
    </section>
  );
}
