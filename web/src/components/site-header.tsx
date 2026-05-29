import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonVariants } from './ui/button';
import { LocaleSwitcher } from './locale-switcher';

export function SiteHeader() {
  const t = useTranslations('Nav');

  return (
    <header className="w-full">
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          The Spot
        </Link>

        <div className="flex items-center gap-7">
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <Link href="/" className="transition-colors duration-300 ease-smooth hover:text-foreground">
              {t('home')}
            </Link>
            <Link
              href="/listings"
              className="transition-colors duration-300 ease-smooth hover:text-foreground"
            >
              {t('listings')}
            </Link>
          </nav>

          <Link href="/listings/new" className={buttonVariants({ size: 'sm' })}>
            {t('postListing')}
          </Link>

          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
