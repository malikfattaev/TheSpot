'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/session';
import { isValidTelegram, normalizeTelegram } from '@/lib/telegram';

export type ProfileActionResult = { ok?: boolean; error?: string };

export type ProfileInput = {
  fullName: string;
  telegramUsername: string;
};

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  telegramUsername: z.string().trim().max(64),
});

/**
 * Update the signed-in user's editable profile fields. The phone number is the
 * account identity and is intentionally NOT changeable here.
 */
export async function updateProfile(raw: ProfileInput): Promise<ProfileActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'unauthorized' };
  }

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: 'invalidFields' };
  }

  // Telegram is optional; blank clears it, otherwise it must be a valid handle.
  let telegram: string | null = null;
  if (parsed.data.telegramUsername.trim() !== '') {
    const handle = normalizeTelegram(parsed.data.telegramUsername);
    if (!isValidTelegram(handle)) {
      return { error: 'invalidTelegram' };
    }
    telegram = handle;
  }

  if (!process.env.DATABASE_URL) {
    return { error: 'databaseUnavailable' };
  }

  try {
    const { prisma } = await import('@thespot/db');
    await prisma.user.update({
      where: { id: user.id },
      data: { fullName: parsed.data.fullName, telegramUsername: telegram },
    });
  } catch {
    return { error: 'unknown' };
  }

  // Header initials and owner cards read the name — refresh the whole layout.
  revalidatePath('/', 'layout');
  return { ok: true };
}
