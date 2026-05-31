import type { Metadata } from 'next';
import { BadgeCheck, Building2, MessagesSquare } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { canPublishListings } from '@thespot/db/roles';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Nav' });
  return { title: t('about') };
}

const features = [
  { key: 'verified', icon: BadgeCheck },
  { key: 'listings', icon: Building2 },
  { key: 'contact', icon: MessagesSquare },
] as const;

export default async function AboutPage() {
  const t = await getTranslations('About');
  const user = await getCurrentUser();
  // Seekers don't publish listings, so don't invite them to post one.
  const canPost = !user || canPublishListings(user.role);

  return (
    <section className="container">
      <div className="flex flex-col items-center gap-7 py-16 text-center sm:py-32">
        <h1
          className="animate-fade-up max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl"
          style={{ animationDelay: '40ms' }}
        >
          {t('heroTitle')}
        </h1>

        <p
          className="animate-fade-up text-muted-foreground max-w-xl text-lg"
          style={{ animationDelay: '120ms' }}
        >
          {t('heroSubtitle')}
        </p>

        <div
          className="animate-fade-up flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: '200ms' }}
        >
          <Link href="/listings" className={buttonVariants({ size: 'lg' })}>
            {t('ctaBrowse')}
          </Link>
          {canPost ? (
            <Link href="/listings/new" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              {t('ctaPost')}
            </Link>
          ) : null}
        </div>

        <div className="mt-8 grid w-full max-w-4xl gap-4 sm:mt-14 sm:grid-cols-3">
          {features.map(({ key, icon: Icon }, index) => (
            <article
              key={key}
              className="surface animate-fade-up ease-smooth hover:shadow-soft rounded-3xl p-6 text-left transition-all duration-300 hover:-translate-y-1 active:scale-[1.03]"
              style={{ animationDelay: `${280 + index * 80}ms` }}
            >
              <span className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-2xl">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{t(`features.${key}.title`)}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t(`features.${key}.description`)}
              </p>
            </article>
          ))}
        </div>

        <div
          className="surface animate-fade-up mt-6 w-full max-w-3xl rounded-3xl p-8 sm:mt-10 sm:p-10"
          style={{ animationDelay: '520ms' }}
        >
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('ux.title')}</h2>
          <p className="text-muted-foreground mt-4 leading-7">{t('ux.body')}</p>
          <p className="text-muted-foreground mt-3 leading-7">{t('ux.note')}</p>
          {!user ? (
            <Link href="/register" className={`${buttonVariants({ size: 'lg' })} mt-6`}>
              {t('ctaRegister')}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
