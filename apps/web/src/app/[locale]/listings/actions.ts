'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { canPublishListings } from '@thespot/db/roles';
import { getCurrentUser } from '@/lib/session';
import { routing, type Locale } from '@/i18n/routing';

export type ListingActionResult = { error?: string; id?: string };

const listingSchema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(10).max(4000),
  type: z.enum(['APARTMENT', 'ROOM', 'HOUSE', 'STUDIO', 'COMMERCIAL']),
  rooms: z.coerce.number().int().min(0).max(50),
  areaSqm: z.coerce.number().positive().max(100000).nullable().optional(),
  floor: z.coerce.number().int().min(0).max(300).nullable().optional(),
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().max(80).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  price: z.coerce.number().positive().max(1_000_000_000_000),
  currency: z.enum(['UZS', 'USD']),
  publish: z.boolean().default(true),
  imageUrls: z.array(z.string().url()).max(12).default([]),
});

/**
 * Shape the client form submits. Numeric fields arrive as strings (raw input
 * values) and are coerced by `listingSchema` on the server — Zod's `z.input`
 * can't express that, so the contract is declared explicitly.
 */
export type ListingInput = {
  title: string;
  description: string;
  type: 'APARTMENT' | 'ROOM' | 'HOUSE' | 'STUDIO' | 'COMMERCIAL';
  rooms: string;
  areaSqm: string | null;
  floor: string | null;
  city: string;
  district: string | null;
  address: string | null;
  price: string;
  currency: 'UZS' | 'USD';
  publish: boolean;
  imageUrls: string[];
};

function resolveLocale(rawLocale: string): Locale {
  return (routing.locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : routing.defaultLocale;
}

/** Empty optional strings become `null` so they don't fail length checks. */
function blankToNull(input: ListingInput): ListingInput {
  const cleaned = { ...input } as Record<string, unknown>;
  for (const key of ['district', 'address', 'areaSqm', 'floor'] as const) {
    if (cleaned[key] === '' || cleaned[key] === undefined) {
      cleaned[key] = null;
    }
  }
  return cleaned as ListingInput;
}

export async function createListing(
  raw: ListingInput,
  rawLocale: string,
): Promise<ListingActionResult> {
  const user = await getCurrentUser();
  if (!user || !canPublishListings(user.role)) {
    return { error: 'forbidden' };
  }

  const parsed = listingSchema.safeParse(blankToNull(raw));
  if (!parsed.success) {
    return { error: 'invalidFields' };
  }

  if (!process.env.DATABASE_URL) {
    return { error: 'databaseUnavailable' };
  }

  const data = parsed.data;
  const locale = resolveLocale(rawLocale);

  try {
    const { prisma } = await import('@thespot/db');
    await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: data.publish ? new Date() : null,
        price: data.price,
        currency: data.currency,
        rooms: data.rooms,
        areaSqm: data.areaSqm ?? null,
        floor: data.floor ?? null,
        city: data.city,
        district: data.district ?? null,
        address: data.address ?? null,
        ownerId: user.id,
        images: {
          create: data.imageUrls.map((url, position) => ({ url, position })),
        },
      },
    });
  } catch {
    return { error: 'unknown' };
  }

  revalidatePath('/', 'layout');
  redirect(`/${locale}/profile/listings`);
}

export async function updateListing(
  id: string,
  raw: ListingInput,
  rawLocale: string,
): Promise<ListingActionResult> {
  const user = await getCurrentUser();
  if (!user || !canPublishListings(user.role)) {
    return { error: 'forbidden' };
  }

  const parsed = listingSchema.safeParse(blankToNull(raw));
  if (!parsed.success) {
    return { error: 'invalidFields' };
  }

  if (!process.env.DATABASE_URL) {
    return { error: 'databaseUnavailable' };
  }

  const data = parsed.data;
  const locale = resolveLocale(rawLocale);

  try {
    const { prisma } = await import('@thespot/db');
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { ownerId: true, publishedAt: true },
    });
    if (!existing) {
      return { error: 'notFound' };
    }
    if (existing.ownerId !== user.id) {
      return { error: 'forbidden' };
    }

    // Replace the image set in one transaction so the gallery always matches
    // exactly what the owner submitted.
    await prisma.$transaction([
      prisma.listingImage.deleteMany({ where: { listingId: id } }),
      prisma.listing.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          status: data.publish ? 'PUBLISHED' : 'DRAFT',
          // Keep the original publish time once set; stamp it on first publish.
          publishedAt: data.publish ? (existing.publishedAt ?? new Date()) : null,
          price: data.price,
          currency: data.currency,
          rooms: data.rooms,
          areaSqm: data.areaSqm ?? null,
          floor: data.floor ?? null,
          city: data.city,
          district: data.district ?? null,
          address: data.address ?? null,
          images: {
            create: data.imageUrls.map((url, position) => ({ url, position })),
          },
        },
      }),
    ]);
  } catch {
    return { error: 'unknown' };
  }

  revalidatePath('/', 'layout');
  redirect(`/${locale}/profile/listings`);
}

export async function deleteListing(id: string, rawLocale: string): Promise<ListingActionResult> {
  const user = await getCurrentUser();
  if (!user || !canPublishListings(user.role)) {
    return { error: 'forbidden' };
  }

  if (!process.env.DATABASE_URL) {
    return { error: 'databaseUnavailable' };
  }

  const locale = resolveLocale(rawLocale);

  try {
    const { prisma } = await import('@thespot/db');
    const existing = await prisma.listing.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!existing || existing.ownerId !== user.id) {
      return { error: 'forbidden' };
    }
    await prisma.listing.delete({ where: { id } });
  } catch {
    return { error: 'unknown' };
  }

  revalidatePath('/', 'layout');
  revalidatePath(`/${locale}/profile/listings`);
  return {};
}
