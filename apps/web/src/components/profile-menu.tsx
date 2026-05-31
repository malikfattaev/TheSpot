'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, Info, LayoutList, LogOut, Phone, Plus, Settings } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { canPublishListings } from '@thespot/db/roles';
import { signOut } from '@/app/[locale]/login/actions';
import { Link } from '@/i18n/navigation';
import type { SessionUser } from '@/lib/session';
import { buttonVariants } from './ui/button';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

const itemClass =
  'hover:bg-foreground/5 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-200';

export function ProfileMenu({ user }: { user: SessionUser | null }) {
  const t = useTranslations('Profile');
  const tRoles = useTranslations('Roles');
  const tNav = useTranslations('Nav');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link href="/login" className={buttonVariants({ size: 'sm' })}>
        {t('login')}
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('menu')}
        onClick={() => setOpen((value) => !value)}
        className="bg-primary text-primary-foreground ease-smooth flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold transition-opacity duration-300 hover:opacity-90"
      >
        {getInitials(user.fullName)}
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade-in border-border bg-card absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl border p-2 shadow-xl"
        >
          <div className="px-3 py-2">
            <p className="font-semibold leading-tight">{user.fullName}</p>
            <p className="text-muted-foreground mt-1 text-sm">{tRoles(user.role)}</p>
            <p className="text-muted-foreground text-sm">{user.phone}</p>
          </div>

          <div className="bg-border my-1 h-px" />
          <Link href="/profile" role="menuitem" onClick={close} className={itemClass}>
            <Settings className="text-muted-foreground h-4 w-4" aria-hidden />
            {t('editProfile')}
          </Link>
          <Link href="/favorites" role="menuitem" onClick={close} className={itemClass}>
            <Heart className="text-muted-foreground h-4 w-4" aria-hidden />
            {t('favorites')}
          </Link>

          {canPublishListings(user.role) && (
            <>
              <Link href="/profile/listings" role="menuitem" onClick={close} className={itemClass}>
                <LayoutList className="text-muted-foreground h-4 w-4" aria-hidden />
                {t('myListings')}
              </Link>
              <Link href="/listings/new" role="menuitem" onClick={close} className={itemClass}>
                <Plus className="text-muted-foreground h-4 w-4" aria-hidden />
                {t('addListing')}
              </Link>
            </>
          )}

          <div className="bg-border my-1 h-px" />
          <Link href="/contacts" role="menuitem" onClick={close} className={itemClass}>
            <Phone className="text-muted-foreground h-4 w-4" aria-hidden />
            {tNav('contacts')}
          </Link>
          <Link href="/about" role="menuitem" onClick={close} className={itemClass}>
            <Info className="text-muted-foreground h-4 w-4" aria-hidden />
            {tNav('about')}
          </Link>

          <div className="bg-border my-1 h-px" />
          <form action={signOut}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              role="menuitem"
              className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {t('logout')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
