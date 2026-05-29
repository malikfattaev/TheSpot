import { getTranslations, setRequestLocale } from 'next-intl/server';

type NewListingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewListingPage({ params }: NewListingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('PostListing');

  return (
    <section className="container py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">{t('subtitle')}</p>
    </section>
  );
}
