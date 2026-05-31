'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/session';

export type ToggleFavoriteResult = { favorited?: boolean; error?: string };

const listingIdSchema = z.string().trim().min(1).max(64);

/**
 * Add or remove a listing from the current user's favorites. Returns the new
 * state so the client can settle its optimistic heart. Signing in is required —
 * a signed-out caller gets `unauthorized` and is sent to login by the button.
 */
export async function toggleFavorite(rawListingId: string): Promise<ToggleFavoriteResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'unauthorized' };
  }

  const parsed = listingIdSchema.safeParse(rawListingId);
  if (!parsed.success) {
    return { error: 'invalidFields' };
  }
  const listingId = parsed.data;

  if (!process.env.DATABASE_URL) {
    return { error: 'databaseUnavailable' };
  }

  try {
    const { prisma } = await import('@thespot/db');
    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: user.id, listingId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    await prisma.favorite.create({ data: { userId: user.id, listingId } });
    return { favorited: true };
  } catch {
    // A bad listingId trips the foreign key — treat it as a generic failure.
    return { error: 'unknown' };
  }
}
