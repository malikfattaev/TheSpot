import type { Metadata } from 'next';
import { BadgeCheck, Building2, MessagesSquare } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

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

  return (
    <section className="container py-12 sm:py-16">
      <h1 className="animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">
        {t('heroTitle')}
      </h1>
      <p
        className="text-muted-foreground animate-fade-up mt-3 max-w-2xl leading-7"
        style={{ animationDelay: '60ms' }}
      >
        {t('heroSubtitle')}
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {features.map(({ key, icon: Icon }, index) => (
          <article
            key={key}
            className="surface animate-fade-up ease-smooth hover:shadow-soft rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${120 + index * 80}ms` }}
          >
            <span className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-2xl">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 font-semibold">{t(`features.${key}.title`)}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{t(`features.${key}.description`)}</p>
          </article>
        ))}
      </div>

      <div
        className="surface animate-fade-up mt-6 rounded-3xl p-8 sm:p-10"
        style={{ animationDelay: '360ms' }}
      >
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('ux.title')}</h2>
        <p className="text-muted-foreground mt-4 max-w-3xl leading-7">{t('ux.body')}</p>
        <p className="text-muted-foreground mt-3 max-w-3xl leading-7">{t('ux.note')}</p>
      </div>
    </section>
  );
}
