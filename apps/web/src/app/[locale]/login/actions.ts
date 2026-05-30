'use server';

import { createHash, randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createUserSession, clearUserSession } from '@/lib/session';
import { routing, type Locale } from '@/i18n/routing';

const roleSchema = z.enum(['SEEKER', 'REALTOR', 'OWNER']);

const formSchema = z.object({
  locale: z.enum(routing.locales),
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  phone: z.string().trim().min(7).max(24),
  role: roleSchema,
});

function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

function phoneEmail(phone: string): string {
  const hash = createHash('sha256').update(phone).digest('hex').slice(0, 24);
  return `phone-${hash}@phone.thespot.local`;
}

export async function enterWithPhone(
  _state: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = formSchema.safeParse({
    locale: formData.get('locale'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
    role: formData.get('role'),
  });

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

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`;

  try {
    const { prisma } = await import('@thespot/db');
    const user = await prisma.user.upsert({
      where: { phone },
      create: {
        email: phoneEmail(phone),
        phone,
        passwordHash: `phone-only:${randomUUID()}`,
        fullName,
        role: parsed.data.role,
      },
      update: {
        fullName,
        role: parsed.data.role,
      },
      select: { id: true },
    });

    await createUserSession(user.id);
  } catch {
    return { error: 'unknown' };
  }

  revalidatePath(`/${parsed.data.locale}`);
  redirect(`/${parsed.data.locale}`);
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
