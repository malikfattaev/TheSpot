import { BadgeCheck, HandCoins, Search, Sparkles } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const features = [
  { key: 'search', icon: Search },
  { key: 'verified', icon: BadgeCheck },
  { key: 'noFee', icon: HandCoins },
] as const;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');

  return (
    <section className="relative overflow-hidden">
      <HeroBlobs />

      <div className="container relative flex flex-col items-center gap-7 py-24 text-center sm:py-32">
        <span className="glass animate-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-glass">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          {t('badge')}
        </span>

        <h1
          className="animate-fade-up max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl"
          style={{ animationDelay: '80ms' }}
        >
          <span className="text-gradient">{t('heroTitle')}</span>
        </h1>

        <p
          className="animate-fade-up max-w-xl text-lg text-muted-foreground"
          style={{ animationDelay: '160ms' }}
        >
          {t('heroSubtitle')}
        </p>

        <div
          className="animate-fade-up flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: '240ms' }}
        >
          <Link href="/listings" className={buttonVariants({ size: 'lg' })}>
            {t('ctaBrowse')}
          </Link>
          <Link href="/listings/new" className={buttonVariants({ variant: 'glass', size: 'lg' })}>
            {t('ctaPost')}
          </Link>
        </div>

        <div className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {features.map(({ key, icon: Icon }, index) => (
            <article
              key={key}
              className="glass animate-fade-up rounded-3xl p-6 text-left shadow-glass transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-soft"
              style={{ animationDelay: `${320 + index * 80}ms` }}
            >
              <span className="bg-brand flex h-11 w-11 items-center justify-center rounded-2xl shadow-glow">
                <Icon className="h-5 w-5 text-primary-foreground" aria-hidden />
              </span>
              <h3 className="mt-4 font-bold">{t(`features.${key}.title`)}</h3>
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

function HeroBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="animate-float absolute -left-24 top-4 h-72 w-72 rounded-full bg-[hsl(var(--grad-violet))] opacity-50 blur-3xl" />
      <div className="animate-float-slow absolute -right-16 top-24 h-80 w-80 rounded-full bg-[hsl(var(--grad-sky))] opacity-50 blur-3xl" />
      <div
        className="animate-float absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[hsl(var(--grad-pink))] opacity-40 blur-3xl"
        style={{ animationDelay: '2.5s' }}
      />
    </div>
  );
}
