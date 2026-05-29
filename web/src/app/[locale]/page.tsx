import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');

  return (
    <section className="container flex flex-col items-start gap-6 py-24">
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">{t('heroTitle')}</h1>
      <p className="max-w-xl text-lg text-muted-foreground">{t('heroSubtitle')}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/listings"
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t('ctaBrowse')}
        </Link>
        <Link
          href="/listings/new"
          className="rounded-md border border-input px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {t('ctaPost')}
        </Link>
      </div>
    </section>
  );
}
