import { getListingObject } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type MediaRouteProps = {
  params: Promise<{ key: string[] }>;
};

/**
 * Streams a listing photo from the private bucket. The DB stores object keys
 * (not public URLs) because the bucket rejects public access, so every image
 * is fetched server-side and proxied here.
 */
export async function GET(_request: Request, { params }: MediaRouteProps): Promise<Response> {
  const { key } = await params;
  const objectKey = key.map((part) => decodeURIComponent(part)).join('/');

  // Only listing images are served through this endpoint.
  if (!objectKey.startsWith('listings/')) {
    return new Response(null, { status: 404 });
  }

  const object = await getListingObject(objectKey);
  if (!object) {
    return new Response(null, { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
