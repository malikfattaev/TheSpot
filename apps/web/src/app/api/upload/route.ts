import { NextResponse } from 'next/server';
import { canPublishListings } from '@thespot/db/roles';
import { getCurrentUser } from '@/lib/session';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  isStorageConfigured,
  uploadListingImage,
} from '@/lib/storage';

export const runtime = 'nodejs';

const MAX_FILES = 12;

/**
 * Receives listing photos as multipart form data and stores them in the
 * bucket, returning their public URLs. Only publishers may upload. Using a
 * route handler (not a server action) avoids the small server-action body
 * limit on multi-photo uploads.
 */
export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!canPublishListings(user.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!isStorageConfigured()) {
    return NextResponse.json({ error: 'storageUnavailable' }, { status: 503 });
  }

  const formData = await request.formData();
  const files = formData.getAll('files').filter((value): value is File => value instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: 'noFiles' }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: 'tooManyFiles' }, { status: 400 });
  }

  for (const file of files) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'invalidType' }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'tooLarge' }, { status: 400 });
    }
  }

  try {
    const urls = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return uploadListingImage(buffer);
      }),
    );
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: 'uploadFailed' }, { status: 500 });
  }
}
