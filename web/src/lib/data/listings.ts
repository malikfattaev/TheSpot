export type ListingCardData = {
  id: string;
  title: string;
  price: number;
  currency: string;
  rooms: number;
  city: string;
  imageUrl: string | null;
};

/**
 * Published listings for the public feed.
 *
 * The database isn't connected yet, so without a `DATABASE_URL` this returns
 * an empty feed instead of failing the build. Once Postgres is wired up and
 * seeded, listings appear automatically — no call sites change.
 */
export async function getPublishedListings(limit = 24): Promise<ListingCardData[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const { prisma } = await import('@thespot/db');
    const listings = await prisma.listing.findMany({
      where: { status: 'PUBLISHED' },
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
