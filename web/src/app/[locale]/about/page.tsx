import type { Metadata } from 'next';
import { BadgeCheck, HandCoins, Search } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Nav' });
  return { title: t('about') };
}

const features = [
  { key: 'search', icon: Search },
  { key: 'verified', icon: BadgeCheck },
  { key: 'noFee', icon: HandCoins },
] as const;

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('About');

  return (
    <section className="container">
      <div className="flex flex-col items-center gap-7 py-24 text-center sm:py-32">
        <h1
          className="animate-fade-up max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl"
          style={{ animationDelay: '40ms' }}
        >
          {t('heroTitle')}
        </h1>

        <p
          className="animate-fade-up max-w-xl text-lg text-muted-foreground"
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
          <Link href="/listings/new" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            {t('ctaPost')}
          </Link>
        </div>

        <div className="mt-14 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {features.map(({ key, icon: Icon }, index) => (
            <article
              key={key}
              className="surface animate-fade-up rounded-3xl p-6 text-left transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-soft active:scale-[1.03]"
              style={{ animationDelay: `${280 + index * 80}ms` }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{t(`features.${key}.title`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`features.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
