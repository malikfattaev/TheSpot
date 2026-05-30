'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LayoutList, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { canPublishListings } from '@thespot/db/roles';
import { Link } from '@/i18n/navigation';
import type { SessionUser } from '@/lib/session';
import { buttonVariants } from './ui/button';
import { cn } from '@/lib/utils';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function ProfileMenu({ user }: { user: SessionUser | null }) {
  const t = useTranslations('Profile');
  const tRoles = useTranslations('Roles');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        className="border-foreground/15 bg-card/50 ease-smooth hover:bg-card/80 flex items-center gap-2 rounded-full border py-1 pl-1 pr-2 transition-colors duration-300"
      >
        <span className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
          {getInitials(user.fullName)}
        </span>
        <ChevronDown
          className={cn(
            'text-muted-foreground ease-smooth h-4 w-4 transition-transform duration-300',
            open && 'rotate-180',
          )}
          aria-hidden
        />
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

          {canPublishListings(user.role) && (
            <Link
              href="/profile/listings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="hover:bg-foreground/5 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-200"
            >
              <LayoutList className="text-muted-foreground h-4 w-4" aria-hidden />
              {t('myListings')}
            </Link>
          )}

          <button
            type="button"
            role="menuitem"
            className="text-muted-foreground hover:bg-foreground/5 hover:text-foreground flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-200"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
