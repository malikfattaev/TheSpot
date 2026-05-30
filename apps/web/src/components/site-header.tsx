import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/session';
import { LocaleSwitcher } from './locale-switcher';
import { ProfileMenu } from './profile-menu';

const navLinkClass = 'transition-colors duration-300 ease-smooth hover:text-foreground';

export async function SiteHeader() {
  const t = await getTranslations('Nav');
  const user = await getCurrentUser();

  return (
    <header className="relative z-50 w-full">
      <div className="container flex h-20 items-center justify-between gap-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          The Spot
        </Link>

        <div className="flex items-center gap-5 sm:gap-6">
          <nav className="text-muted-foreground hidden items-center gap-7 text-sm md:flex">
            <Link href="/about" className={navLinkClass}>
              {t('about')}
            </Link>
            <Link href="/contacts" className={navLinkClass}>
              {t('contacts')}
            </Link>
          </nav>

          <LocaleSwitcher />
          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
