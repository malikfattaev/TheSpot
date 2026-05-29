import { getTranslations, setRequestLocale } from 'next-intl/server';

type ProfileListingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfileListingsPage({ params }: ProfileListingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <section className="container py-20">
      <h1 className="animate-fade-up text-3xl font-semibold tracking-tight sm:text-4xl">
        {t('Profile.myListings')}
      </h1>
      <div className="surface animate-fade-up mt-8 rounded-3xl p-12 text-center text-muted-foreground">
        {t('Home.empty')}
      </div>
    </section>
  );
}
