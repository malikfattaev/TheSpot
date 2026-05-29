export type ListingCardData = {
  id: string;
  title: string;
  price: number;
  currency: string;
  rooms: number;
  city: string;
  imageUrl: string | null;
};

export type ListingFilters = {
  /** Minimum number of rooms (e.g. `2` matches 2+ rooms). */
  rooms?: number;
  /** District name, matched case-insensitively as a substring. */
  district?: string;
  /** Maximum price, inclusive. */
  maxPrice?: number;
};

/**
 * Published listings for the public feed, optionally filtered. An empty
 * filter returns every published listing.
 *
 * The database isn't connected yet, so without a `DATABASE_URL` this returns
 * an empty feed instead of failing the build. Once Postgres is wired up and
 * seeded, listings appear automatically — no call sites change.
 */
export async function getPublishedListings(
  filters: ListingFilters = {},
  limit = 24,
): Promise<ListingCardData[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const { prisma } = await import('@thespot/db');
    const listings = await prisma.listing.findMany({
      where: {
        status: 'PUBLISHED',
        ...(filters.rooms ? { rooms: { gte: filters.rooms } } : {}),
        ...(filters.district
          ? { district: { contains: filters.district, mode: 'insensitive' } }
          : {}),
        ...(filters.maxPrice ? { price: { lte: filters.maxPrice } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      include: { images: { orderBy: { position: 'asc' }, take: 1 } },
    });

    return listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      price: Number(listing.price),
      currency: listing.currency,
      rooms: listing.rooms,
      city: listing.city,
      imageUrl: listing.images[0]?.url ?? null,
    }));
  } catch {
    return [];
  }
}
