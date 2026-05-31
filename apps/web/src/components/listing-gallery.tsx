'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type GalleryImage = { id: string; url: string; alt: string | null };

export function ListingGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="from-secondary to-accent aspect-[16/9] w-full rounded-3xl bg-gradient-to-br" />;
  }

  const current = images[active] ?? images[0]!;

  return (
    <div className="grid gap-3">
      <div className="bg-secondary aspect-[16/9] w-full overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.alt ?? title} className="h-full w-full object-cover" />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                index === active ? 'border-foreground' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
