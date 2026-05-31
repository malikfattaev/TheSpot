'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { mediaSrc } from '@/lib/media';
import { cn } from '@/lib/utils';

type GalleryImage = { id: string; url: string; alt: string | null };

export function ListingGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const t = useTranslations('Listing');
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="from-secondary to-accent aspect-[16/9] w-full rounded-3xl bg-gradient-to-br" />
    );
  }

  const hasMany = images.length > 1;
  const current = images[active] ?? images[0]!;
  const go = (delta: number) =>
    setActive((index) => (index + delta + images.length) % images.length);

  const arrowClass =
    'absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/60';

  return (
    <div className="grid gap-3">
      <div className="bg-secondary relative aspect-[16/9] w-full overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mediaSrc(current.url)}
          alt={current.alt ?? title}
          className="h-full w-full object-cover"
        />

        {hasMany ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t('prevPhoto')}
              className={cn(arrowClass, 'left-3')}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t('nextPhoto')}
              className={cn(arrowClass, 'right-3')}
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {active + 1} / {images.length}
            </div>
          </>
        ) : null}
      </div>

      {hasMany ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                index === active
                  ? 'border-foreground'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaSrc(image.url)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
