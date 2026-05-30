import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { UserRole } from '@thespot/db/roles';

const SESSION_COOKIE = 'thespot_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

/** The currently signed-in user, as needed by the UI. */
export type SessionUser = {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
};

function getSessionSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.DATABASE_URL ?? 'thespot-local-session-secret';
}

function signSessionValue(userId: string): string {
  return createHmac('sha256', getSessionSecret()).update(userId).digest('base64url');
}

function createSessionValue(userId: string): string {
  return `${userId}.${signSessionValue(userId)}`;
}

function readSignedUserId(value: string | undefined): string | null {
  if (!value) return null;

  const separatorIndex = value.lastIndexOf('.');
  if (separatorIndex === -1) return null;

  const userId = value.slice(0, separatorIndex);
  const signature = value.slice(separatorIndex + 1);
  const expectedSignature = signSessionValue(userId);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) return null;
  return timingSafeEqual(signatureBuffer, expectedBuffer) ? userId : null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userId = readSignedUserId(cookieStore.get(SESSION_COOKIE)?.value);

  if (!userId || !process.env.DATABASE_URL) {
    return null;
  }

  try {
    const { prisma } = await import('@thespot/db');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, phone: true, role: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone ?? '',
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function createUserSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue(userId), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
