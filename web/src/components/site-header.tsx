import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './locale-switcher';

export function SiteHeader() {
  const t = useTranslations('Nav');

  return (
    <header className="border-b border-border">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="h-5 w-5 text-primary" aria-hidden />
          The Spot
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            {t('home')}
          </Link>
          <Link href="/listings" className="transition-colors hover:text-foreground">
            {t('listings')}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/listings/new"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t('postListing')}
          </Link>
        </div>
      </div>
    </header>
  );
}
