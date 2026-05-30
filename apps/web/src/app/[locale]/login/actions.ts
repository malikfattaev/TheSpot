'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clearUserSession, createUserSession } from '@/lib/session';
import { isValidPhone, normalizePhone } from '@/lib/phone';
import { isValidOtp } from '@/lib/otp';
import { routing, type Locale } from '@/i18n/routing';

type ActionResult = { error?: string };

const phoneSchema = z.string().trim().min(7).max(24);
const localeSchema = z.enum(routing.locales);

async function findUserIdByPhone(phone: string): Promise<string | null> {
  const { prisma } = await import('@thespot/db');
  const user = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
  return user?.id ?? null;
}

/** Step 1: validate the phone and confirm an account exists, then "send" a code. */
export async function requestLoginCode(rawPhone: string): Promise<ActionResult> {
  const parsed = phoneSchema.safeParse(rawPhone);
  if (!parsed.success) {
    return { error: 'invalidPhone' };
  }

  const phone = normalizePhone(parsed.data);
  if (!isValidPhone(phone)) {
    return { error: 'invalidPhone' };
  }

  if (!process.env.DATABASE_URL) {
    return { error: 'databaseUnavailable' };
  }

  try {
    if (!(await findUserIdByPhone(phone))) {
      return { error: 'noAccount' };
    }
  } catch {
    return { error: 'unknown' };
  }

  // The verification code is fixed (see DEV_OTP); no message is sent yet.
  return {};
}

/** Step 2: check the code and sign the matching user in. */
export async function verifyLogin(
  rawPhone: string,
  code: string,
  rawLocale: string,
): Promise<ActionResult> {
  const phoneParsed = phoneSchema.safeParse(rawPhone);
  const localeParsed = localeSchema.safeParse(rawLocale);
  if (!phoneParsed.success || !localeParsed.success) {
    return { error: 'invalidPhone' };
  }

  const phone = normalizePhone(phoneParsed.data);
  if (!isValidPhone(phone)) {
    return { error: 'invalidPhone' };
  }

  if (!isValidOtp(code)) {
    return { error: 'invalidCode' };
  }

  if (!process.env.DATABASE_URL) {
    return { error: 'databaseUnavailable' };
  }

  try {
    const userId = await findUserIdByPhone(phone);
    if (!userId) {
      return { error: 'noAccount' };
    }
    await createUserSession(userId);
  } catch {
    return { error: 'unknown' };
  }

  revalidatePath(`/${localeParsed.data}`);
  redirect(`/${localeParsed.data}`);
}

export async function signOut(formData: FormData) {
  const rawLocale = formData.get('locale');
  const locale: Locale = routing.locales.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : routing.defaultLocale;

  await clearUserSession();
  revalidatePath(`/${locale}`);
  redirect(`/${locale}`);
}
