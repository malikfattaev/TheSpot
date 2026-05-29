import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from './ui/button';
import { LocaleSwitcher } from './locale-switcher';

export function SiteHeader() {
  const t = useTranslations('Nav');

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="container glass flex h-16 items-center justify-between gap-4 rounded-full px-4 shadow-glass sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold">
          <span className="bg-brand flex h-9 w-9 items-center justify-center rounded-2xl shadow-glow">
            <MapPin className="h-5 w-5 text-primary-foreground" aria-hidden />
          </span>
          <span className="text-lg">
            The <span className="text-gradient">Spot</span>
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 text-sm font-medium md:flex">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-muted-foreground transition-colors duration-300 ease-smooth hover:bg-foreground/5 hover:text-foreground"
          >
            {t('home')}
          </Link>
          <Link
            href="/listings"
            className="rounded-full px-4 py-2 text-muted-foreground transition-colors duration-300 ease-smooth hover:bg-foreground/5 hover:text-foreground"
          >
            {t('listings')}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher />
          <Link href="/listings/new" className={buttonVariants({ size: 'sm' })}>
            {t('postListing')}
          </Link>
        </div>
      </div>
    </header>
  );
}
