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

  // Copy into a fresh ArrayBuffer so the body is a plain BlobPart, sidestepping
  // the SharedArrayBuffer-tinged Uint8Array type the SDK hands back.
  const bytes = new Uint8Array(object.body);
  return new Response(bytes.buffer.slice(0) as ArrayBuffer, {
    headers: {
      'Content-Type': object.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
