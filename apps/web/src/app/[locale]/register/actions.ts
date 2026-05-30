'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@thespot/db';
import { z } from 'zod';
import { createUserSession } from '@/lib/session';
import { isValidPhone, normalizePhone, phoneEmail } from '@/lib/phone';
import { isValidOtp } from '@/lib/otp';
import { routing, type Locale } from '@/i18n/routing';

type ActionResult = { error?: string };

const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  phone: z.string().trim().min(7).max(24),
  role: z.enum(['SEEKER', 'REALTOR', 'OWNER']),
});

export type RegisterInput = z.infer<typeof registerSchema>;

async function phoneTaken(phone: string): Promise<boolean> {
  const { prisma } = await import('@thespot/db');
  const user = await prisma.user.findUnique({ where: { phone }, select: { id: true } });
  return Boolean(user);
}

/** Step 1: validate the details and confirm the phone is free, then "send" a code. */
export async function requestRegisterCode(raw: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: 'invalidFields' };
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!isValidPhone(phone)) {
    return { error: 'invalidPhone' };
  }

  if (!process.env.DATABASE_URL) {
    return { error: 'databaseUnavailable' };
  }

  try {
    if (await phoneTaken(phone)) {
      return { error: 'phoneTaken' };
    }
  } catch {
    return { error: 'unknown' };
  }

  // The verification code is fixed (see DEV_OTP); no message is sent yet.
  return {};
}

/** Step 2: check the code, create the account, and sign the new user in. */
export async function verifyRegister(
  raw: RegisterInput,
  code: string,
  rawLocale: string,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(raw);
  const locale: Locale | null = routing.locales.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : null;
  if (!parsed.success || !locale) {
    return { error: 'invalidFields' };
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!isValidPhone(phone)) {
    return { error: 'invalidPhone' };
  }

  if (!isValidOtp(code)) {
    return { error: 'invalidCode' };
  }

  if (!process.env.DATABASE_URL) {
    return { error: 'databaseUnavailable' };
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`;

  try {
    const { prisma } = await import('@thespot/db');
    const user = await prisma.user.create({
      data: {
        email: phoneEmail(phone),
        phone,
        passwordHash: `phone-only:${randomUUID()}`,
        fullName,
        role: parsed.data.role,
      },
      select: { id: true },
    });
    await createUserSession(user.id);
  } catch (error) {
    // Unique violation => the phone was registered between step 1 and step 2.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: 'phoneTaken' };
    }
    return { error: 'unknown' };
  }

  revalidatePath('/', 'layout');
  redirect(`/${locale}`);
}
