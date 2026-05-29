import { getTranslations, setRequestLocale } from 'next-intl/server';

type ListingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ListingsPage({ params }: ListingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Listings');

  return (
    <section className="container py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-4 text-muted-foreground">{t('empty')}</p>
    </section>
  );
}
