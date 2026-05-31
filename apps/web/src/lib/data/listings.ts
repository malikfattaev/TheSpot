import type { Currency, ListingStatus, Prisma, PropertyType, RentPeriod } from '@thespot/db';

export type ListingCardData = {
  id: string;
  title: string;
  price: number;
  currency: Currency;
  rentPeriod: RentPeriod;
  rooms: number;
  areaSqm: number | null;
  floor: number | null;
  city: string;
  district: string | null;
  imageUrl: string | null;
};

/** A listing as shown to its owner — adds the workflow status. */
export type OwnerListingData = ListingCardData & {
  status: ListingStatus;
};

/** Full listing for the public detail page and the edit form. */
export type ListingDetail = {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: ListingStatus;
  price: number;
  currency: Currency;
  rentPeriod: RentPeriod;
  rooms: number;
  areaSqm: number | null;
  floor: number | null;
  city: string;
  district: string | null;
  address: string | null;
  images: { id: string; url: string; alt: string | null }[];
  owner: {
    id: string;
    fullName: string;
    phone: string | null;
    telegramUsername: string | null;
    role: string;
  };
  createdAt: Date;
};

export type ListingFilters = {
  /** Exact number of rooms. */
  rooms?: number;
  /** District key (see `lib/listing-options`), matched exactly. */
  district?: string;
  /** Maximum price, inclusive. Only meaningful together with `currency`. */
  maxPrice?: number;
  /** Currency to filter by (prices across currencies aren't comparable). */
  currency?: Currency;
  /** Rent period: monthly or daily. */
  rentPeriod?: RentPeriod;
};

const cardSelect = {
  id: true,
  title: true,
  price: true,
  currency: true,
  rentPeriod: true,
  rooms: true,
  areaSqm: true,
  floor: true,
  city: true,
  district: true,
  images: { orderBy: { position: 'asc' }, take: 1, select: { url: true } },
} satisfies Prisma.ListingSelect;

type CardRow = Prisma.ListingGetPayload<{ select: typeof cardSelect }>;

function toCard(listing: CardRow): ListingCardData {
  return {
    id: listing.id,
    title: listing.title,
    price: Number(listing.price),
    currency: listing.currency,
    rentPeriod: listing.rentPeriod,
    rooms: listing.rooms,
    areaSqm: listing.areaSqm,
    floor: listing.floor,
    city: listing.city,
    district: listing.district,
    imageUrl: listing.images[0]?.url ?? null,
  };
}

/**
 * Published listings for the public feed, optionally filtered. An empty
 * filter returns every published listing.
 *
 * Without a `DATABASE_URL` this returns an empty feed instead of failing the
 * build; once Postgres is wired up listings appear automatically.
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
        ...(filters.rooms ? { rooms: filters.rooms } : {}),
        ...(filters.district ? { district: filters.district } : {}),
        ...(filters.rentPeriod ? { rentPeriod: filters.rentPeriod } : {}),
        ...(filters.currency ? { currency: filters.currency } : {}),
        ...(filters.maxPrice ? { price: { lte: filters.maxPrice } } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: cardSelect,
    });

    return listings.map(toCard);
  } catch {
    return [];
  }
}

/** Every listing owned by a user, newest first, regardless of status. */
export async function getListingsByOwner(ownerId: string): Promise<OwnerListingData[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const { prisma } = await import('@thespot/db');
    const listings = await prisma.listing.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      select: { ...cardSelect, status: true },
    });

    return listings.map((listing) => ({ ...toCard(listing), status: listing.status }));
  } catch {
    return [];
  }
}

/** A single listing with full detail, or `null` if not found. */
export async function getListingById(id: string): Promise<ListingDetail | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const { prisma } = await import('@thespot/db');
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: 'asc' }, select: { id: true, url: true, alt: true } },
        owner: {
          select: { id: true, fullName: true, phone: true, telegramUsername: true, role: true },
        },
      },
    });

    if (!listing) return null;

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      type: listing.type,
      status: listing.status,
      price: Number(listing.price),
      currency: listing.currency,
      rentPeriod: listing.rentPeriod,
      rooms: listing.rooms,
      areaSqm: listing.areaSqm,
      floor: listing.floor,
      city: listing.city,
      district: listing.district,
      address: listing.address,
      images: listing.images,
      owner: listing.owner,
      createdAt: listing.createdAt,
    };
  } catch {
    return null;
  }
}

/** Published listings a user saved to favorites, newest save first. */
export async function getFavoriteListings(userId: string): Promise<ListingCardData[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const { prisma } = await import('@thespot/db');
    const favorites = await prisma.favorite.findMany({
      // Only surface still-published listings so saved cards never dead-link.
      where: { userId, listing: { status: 'PUBLISHED' } },
      orderBy: { createdAt: 'desc' },
      select: { listing: { select: cardSelect } },
    });

    return favorites.map((favorite) => toCard(favorite.listing));
  } catch {
    return [];
  }
}

/**
 * The set of listing IDs a user has favorited, for rendering filled/empty
 * hearts across the feed. Returns an empty set when signed out or on error.
 */
export async function getFavoriteListingIds(userId: string | null): Promise<Set<string>> {
  if (!userId || !process.env.DATABASE_URL) {
    return new Set();
  }

  try {
    const { prisma } = await import('@thespot/db');
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    });

    return new Set(favorites.map((favorite) => favorite.listingId));
  } catch {
    return new Set();
  }
}
