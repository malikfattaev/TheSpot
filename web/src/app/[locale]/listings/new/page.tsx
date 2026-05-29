import { getTranslations, setRequestLocale } from 'next-intl/server';

type NewListingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewListingPage({ params }: NewListingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('PostListing');

  return (
    <section className="container py-20">
      <h1 className="animate-fade-up text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>
      <div className="glass animate-fade-up mt-8 max-w-xl rounded-3xl p-10 text-muted-foreground shadow-glass">
        {t('subtitle')}
      </div>
    </section>
  );
}
