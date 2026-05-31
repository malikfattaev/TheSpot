import { randomUUID } from 'node:crypto';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';

/**
 * Object storage for listing photos. The bucket is the S3-compatible one
 * provided by Railway; its credentials arrive as `BUCKET_*` service variables.
 *
 * The bucket is private (the provider rejects public-read ACLs), so we never
 * hand out direct object URLs. Uploads return the object *key*; images are
 * served back through the `/api/media/[...key]` route, which streams the object
 * via `GetObject`. The DB therefore stores keys, not URLs.
 */

type StorageConfig = {
  bucket: string;
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** `path` => endpoint/bucket/key, `virtual` => bucket.host/key. */
  forcePathStyle: boolean;
};

function readConfig(): StorageConfig | null {
  const bucket = process.env.BUCKET_NAME;
  const endpoint = process.env.BUCKET_ENDPOINT;
  const accessKeyId = process.env.BUCKET_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BUCKET_SECRET_ACCESS_KEY;

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    bucket,
    endpoint,
    region: process.env.BUCKET_REGION ?? 'auto',
    accessKeyId,
    secretAccessKey,
    // Railway sets `virtual-host`; anything not virtual-hosted is path style.
    forcePathStyle: !(process.env.BUCKET_URL_STYLE ?? 'path').startsWith('virtual'),
  };
}

let cachedClient: { client: S3Client; config: StorageConfig } | null = null;

function getClient(): { client: S3Client; config: StorageConfig } | null {
  if (cachedClient) return cachedClient;

  const config = readConfig();
  if (!config) return null;

  const client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  cachedClient = { client, config };
  return cachedClient;
}

/** Whether photo uploads can be served (credentials present). */
export function isStorageConfigured(): boolean {
  return readConfig() !== null;
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

export const ACCEPTED_IMAGE_TYPES = Object.keys(EXTENSIONS);
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB raw upload; compressed on the server.

/** Object keys always live under this prefix — see `mediaSrc`. */
export const LISTINGS_PREFIX = 'listings/';

// Listing photos are downscaled to fit this box and re-encoded as WebP. A
// 1600px-wide photo is plenty for a full-bleed gallery while keeping objects
// small (typically 100-300 KB instead of multi-MB originals).
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 78;

/**
 * Resize (never upscale) and re-encode an image to WebP so we never store
 * heavy originals. Falls back to the raw bytes if the image can't be processed.
 */
async function optimizeImage(data: Buffer): Promise<{ body: Buffer; contentType: string; extension: string }> {
  try {
    const body = await sharp(data)
      .rotate() // honour EXIF orientation before stripping metadata
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    return { body, contentType: 'image/webp', extension: 'webp' };
  } catch {
    return { body: data, contentType: 'application/octet-stream', extension: 'bin' };
  }
}

/**
 * Optimize one image and upload it to the (private) bucket, returning its
 * object key. The key is stored in the DB; images are served back through
 * `/api/media/[...key]`. Throws if storage is not configured.
 */
export async function uploadListingImage(data: Buffer): Promise<string> {
  const storage = getClient();
  if (!storage) {
    throw new Error('Object storage is not configured.');
  }

  const { body, contentType, extension } = await optimizeImage(data);

  const key = `${LISTINGS_PREFIX}${randomUUID()}.${extension}`;
  await storage.client.send(
    new PutObjectCommand({
      Bucket: storage.config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return key;
}

export type StoredObject = {
  body: Uint8Array;
  contentType: string;
};

/** Fetch a stored object's bytes for streaming back to the browser. */
export async function getListingObject(key: string): Promise<StoredObject | null> {
  const storage = getClient();
  if (!storage) return null;

  try {
    const result = await storage.client.send(
      new GetObjectCommand({ Bucket: storage.config.bucket, Key: key }),
    );
    if (!result.Body) return null;

    return {
      body: await result.Body.transformToByteArray(),
      contentType: result.ContentType ?? 'application/octet-stream',
    };
  } catch {
    return null;
  }
}
