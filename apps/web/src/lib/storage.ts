import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

/**
 * Object storage for listing photos. The bucket is the S3-compatible one
 * provided by Railway; its credentials arrive as `BUCKET_*` service variables.
 * Uploads are server-side (no browser CORS needed) and stored public-read so
 * the direct object URL can be rendered straight from an `<img>`.
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

function publicUrl(config: StorageConfig, key: string): string {
  const base = config.endpoint.replace(/\/+$/, '');
  if (config.forcePathStyle) {
    return `${base}/${config.bucket}/${key}`;
  }
  const url = new URL(base);
  return `${url.protocol}//${config.bucket}.${url.host}/${key}`;
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

export const ACCEPTED_IMAGE_TYPES = Object.keys(EXTENSIONS);
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB per photo.

/**
 * Upload one image to the bucket and return its public URL. Throws if storage
 * is not configured or the content type is unsupported.
 */
export async function uploadListingImage(
  data: Buffer,
  contentType: string,
): Promise<string> {
  const storage = getClient();
  if (!storage) {
    throw new Error('Object storage is not configured.');
  }

  const extension = EXTENSIONS[contentType];
  if (!extension) {
    throw new Error(`Unsupported image type: ${contentType}`);
  }

  const key = `listings/${randomUUID()}.${extension}`;
  await storage.client.send(
    new PutObjectCommand({
      Bucket: storage.config.bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return publicUrl(storage.config, key);
}
