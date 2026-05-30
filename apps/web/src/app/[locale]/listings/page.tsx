import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ListingsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ListingsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Listings' });
  return { title: t('title') };
}

export default async function ListingsPage({ params }: ListingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Listings');

  return (
    <section className="container py-20">
      <h1 className="animate-fade-up text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>
      <div className="surface animate-fade-up text-muted-foreground mt-8 rounded-3xl p-12 text-center">
        {t('empty')}
      </div>
    </section>
  );
}
