'use client';

import { useState, useTransition, type MouseEvent } from 'react';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { toggleFavorite } from '@/app/[locale]/favorites/actions';
import { cn } from '@/lib/utils';

type FavoriteButtonProps = {
  listingId: string;
  initialFavorited: boolean;
  /**
   * On a favorites-only list, refresh after a toggle so an un-saved card drops
   * out of view. Elsewhere (the feed) the heart just flips in place.
   */
  refreshOnToggle?: boolean;
  className?: string;
};

export function FavoriteButton({
  listingId,
  initialFavorited,
  refreshOnToggle = false,
  className,
}: FavoriteButtonProps) {
  const t = useTranslations('Favorites');
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function handleClick(event: MouseEvent) {
    // The heart usually sits on top of a card-wide link — don't navigate.
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;

    const next = !favorited;
    setFavorited(next); // optimistic
    startTransition(async () => {
      const result = await toggleFavorite(listingId);
      if (result.error) {
        setFavorited(!next); // revert
        if (result.error === 'unauthorized') router.push('/login');
        return;
      }
      setFavorited(result.favorited ?? next);
      if (refreshOnToggle) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? t('remove') : t('add')}
      title={favorited ? t('remove') : t('add')}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/55 disabled:opacity-60',
        className,
      )}
    >
      <Heart
        className={cn('h-[18px] w-[18px] transition-colors', favorited && 'fill-red-500 text-red-500')}
        aria-hidden
      />
    </button>
  );
}
