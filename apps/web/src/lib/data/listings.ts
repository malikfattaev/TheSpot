import type { Currency, ListingStatus, Prisma, PropertyType } from '@thespot/db';

export type ListingCardData = {
  id: string;
  title: string;
  price: number;
  currency: Currency;
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
  rooms: number;
  areaSqm: number | null;
  floor: number | null;
  city: string;
  district: string | null;
  address: string | null;
  images: { id: string; url: string; alt: string | null }[];
  owner: { id: string; fullName: string; phone: string | null; role: string };
  createdAt: Date;
};

export type ListingFilters = {
  /** Minimum number of rooms (e.g. `2` matches 2+ rooms). */
  rooms?: number;
  /** District name, matched case-insensitively as a substring. */
  district?: string;
  /** Maximum price, inclusive. */
  maxPrice?: number;
};

const cardSelect = {
  id: true,
  title: true,
  price: true,
  currency: true,
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
        ...(filters.rooms ? { rooms: { gte: filters.rooms } } : {}),
        ...(filters.district
          ? { district: { contains: filters.district, mode: 'insensitive' } }
          : {}),
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
        owner: { select: { id: true, fullName: true, phone: true, role: true } },
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
