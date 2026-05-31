'use client';

import { useState, useTransition } from 'react';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { deleteListing } from '@/app/[locale]/listings/actions';
import type { OwnerListingData } from '@/lib/data/listings';
import { formatPrice } from '@/lib/format';
import { mediaSrc } from '@/lib/media';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<OwnerListingData['status'], string> = {
  PUBLISHED: 'bg-foreground text-background',
  DRAFT: 'bg-muted text-muted-foreground',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

export function OwnerListingCard({ listing }: { listing: OwnerListingData }) {
  const t = useTranslations('Profile');
  const tCard = useTranslations('ListingCard');
  const tStatus = useTranslations('ListingStatus');
  const locale = useLocale();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteListing(listing.id, locale);
      if (!result?.error) {
        setConfirming(false);
        router.refresh();
      }
    });
  }

  return (
    <article className="surface flex flex-col gap-4 rounded-3xl p-3 sm:flex-row sm:items-center">
      <Link
        href={`/listings/${listing.id}`}
        className="bg-secondary aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-40"
      >
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaSrc(listing.imageUrl)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="from-secondary to-accent h-full w-full bg-gradient-to-br" />
        )}
      </Link>

      <div className="min-w-0 flex-1 px-1 sm:px-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium',
              STATUS_STYLES[listing.status],
            )}
          >
            {tStatus(listing.status)}
          </span>
          {listing.district ? (
            <span className="text-muted-foreground truncate text-xs uppercase tracking-wide">
              {listing.district}
            </span>
          ) : null}
        </div>
        <h3 className="mt-1.5 truncate font-medium">{listing.title}</h3>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {tCard('rooms', { count: listing.rooms })}
          {listing.areaSqm ? ` · ${listing.areaSqm} ${tCard('areaUnit')}` : ''}
        </p>
        <p className="mt-1 font-semibold">
          {formatPrice(listing.price, listing.currency, locale)}
          <span className="text-muted-foreground text-sm font-normal">{tCard('perMonth')}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 px-1 sm:px-2">
        {confirming ? (
          <>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="bg-destructive text-destructive-foreground flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              {t('confirmDelete')}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="text-muted-foreground hover:text-foreground h-10 px-3 text-sm transition-colors"
            >
              {t('cancel')}
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/listings/${listing.id}/edit`}
              aria-label={t('edit')}
              className="border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              aria-label={t('delete')}
              className="border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
