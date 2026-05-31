import { Link } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/session';
import { LocaleSwitcher } from './locale-switcher';
import { ProfileMenu } from './profile-menu';

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="relative z-50 w-full">
      <div className="container flex h-16 items-center justify-between gap-4 sm:h-20 sm:gap-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          The Spot
        </Link>

        <div className="flex items-center gap-2.5">
          <LocaleSwitcher />
          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
