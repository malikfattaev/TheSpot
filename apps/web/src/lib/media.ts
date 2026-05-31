/** Object keys always live under this prefix (mirrors `LISTINGS_PREFIX`). */
const LISTINGS_PREFIX = 'listings/';

/**
 * Turn a stored image reference into a usable `<img src>`. The bucket is
 * private, so images are streamed through `/api/media/[...key]`.
 *
 * Accepts either a bare object key (`listings/abc.jpg`) or a legacy full bucket
 * URL saved before the bucket went key-only — in both cases we locate the
 * `listings/` segment and route it through our media endpoint. Client-safe: no
 * server-only imports, so cards and galleries can call it directly.
 */
export function mediaSrc(value: string): string {
  if (!value) return value;
  if (value.startsWith('/api/media/')) return value;

  const index = value.indexOf(LISTINGS_PREFIX);
  const key = index >= 0 ? value.slice(index) : value;
  return `/api/media/${key}`;
}
